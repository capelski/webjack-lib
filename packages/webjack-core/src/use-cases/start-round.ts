import { getNextCard } from '../services/card-set-service';
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
    tableService.updatePlayersInactivity(table);
    const activePlayers = tableService.getActivePlayers(table);
    tableService.setStatus(table, TableStatus.DealingCards);
    playerService.initializeHand(table.dealer, 0);

    const firstPromiseChain = activePlayers.concat([table.dealer])
        .map(player => () => new Promise(resolve => {
            const hand = playerService.getCurrentHand(player)!;
            handService.addCard(hand, getNextCard(table.cardSet));
            delay(400).then(resolve);
        }))
        .reduce((promiseChain, runPromise) => promiseChain.then(runPromise), Promise.resolve({}));

    const secondPromiseChain = activePlayers
        .map(player => () => new Promise(resolve => {
            const hand = playerService.getCurrentHand(player)!;
            handService.addCard(hand, getNextCard(table.cardSet));
            const isBlackJack = handService.isBlackJack(hand);
            if (isBlackJack) {
                handService.setStatus(hand, HandStatus.BlackJack);
                handService.markAsPlayed(hand);
            }
            delay(400).then(resolve);
        }))
        .reduce((promiseChain, runPromise) => promiseChain.then(runPromise), firstPromiseChain);
    
    return secondPromiseChain.then(_ => {
        tableService.setStatus(table, TableStatus.PlayerTurns);
        updateCurrentRound(tableId);
        return {
            ok: true
        };
    });
}