import { getNextCard } from '../services/card-set-service';
import { getParameters } from '../services/game-parameters-service';
import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { UseCaseResult } from '../types/use-case-result';
import { HandStatus } from '../types/hand-status';
import { TableStatus } from '../types/table-status';
import { delay } from '../utils/js-generics';
import { updateCurrentRound } from './update-current-round';

export const startRound = (tableId: string): Promise<UseCaseResult> => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return Promise.reject({
            ok: false,
            error: 'No table identified by ' + tableId + ' was found'
        });
    }

    if (table.status !== TableStatus.PlacingBets) {
        return Promise.reject({
            ok: false,
            error: 'A round can only be started when some bet has been placed'
        });
    }

    tableService.clearNextAction(table);

    const { maxInactiveRounds } = getParameters();
    table.players.forEach(playerService.increaseInactiveRounds);
    table.players
        .filter(player => player.inactiveRounds > maxInactiveRounds)
        .forEach(player => tableService.removePlayer(table, player.id));

    const activePlayers = tableService.getActivePlayers(table);
    activePlayers.forEach(playerService.resetInactiveRounds);

    playerService.initializeHand(table.dealer, 0);
    tableService.setStatus(table, TableStatus.DealingCards);

    const firstPromiseChain = activePlayers.concat([table.dealer])
        .map(player => () => {
            const hand = playerService.getCurrentHand(player)!;
            handService.addCard(hand, getNextCard(table.cardSet, true));
            tableService.notifySubscribers(tableId);
            return delay(400);
        })
        .reduce((promiseChain, runPromise) => promiseChain.then(runPromise), Promise.resolve());

    const secondPromiseChain = activePlayers
        .map(player => () => {
            const hand = playerService.getCurrentHand(player)!;
            handService.addCard(hand, getNextCard(table.cardSet, true));
            tableService.notifySubscribers(tableId);
            return delay(400);
        })
        .reduce((promiseChain, runPromise) => promiseChain.then(runPromise), firstPromiseChain);
    
    return secondPromiseChain.then(_ => {
        tableService.setStatus(table, TableStatus.PlayerTurns);
        updateCurrentRound(tableId);
        return {
            ok: true
        };
    });
}