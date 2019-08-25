import { collectPlayedCards } from '../services/card-set-service';
import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';
import { TableStatus } from '../types/table-status';
import { delay } from '../utils/js-generics';

export const endRound = (tableId: string): IOperationResult<undefined> => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            error: 'No table identified by ' + tableId + ' was found',
            outcome: IOperationOutcome.error
        };
    }

    if (table.status !== TableStatus.EndingRound) {
        return {
            error: "Round can't be ended now",
            outcome: IOperationOutcome.error
        };
    }

    const dealerHand = table.dealer.hands[0];
    const activePlayers = tableService.getActivePlayers(table);
    const playersEarnings = activePlayers.map(player => {
        const handsEarnings = player.hands.map(hand => handService.resolveHand(hand, dealerHand));
        const earningRate = handsEarnings.reduce((x, y) => x + y, 0);
        return {
            earningRate,
            player
        };
    });

    tableService.setNextAction(table, 5, () => {
        tableService.clearNextAction(table);

        const collectionPromise = playersEarnings.reduce((promiseChain, playerEarning) => {
            return promiseChain.then(_ => {
                playerEarning.player.hands.forEach(handService.clearBet);
                playerService.updateEarningRate(playerEarning.player, playerEarning.earningRate);
                playerService.storeEarningRate(playerEarning.player);
                return delay(400);
            });
        }, Promise.resolve());

        collectionPromise.then(_ => {
            activePlayers.forEach(playerService.clearHands);
            playerService.clearHands(table.dealer);
            collectPlayedCards(table.cardSet);
            tableService.setStatus(table, TableStatus.Idle);
            tableService.notifySubscribers(tableId);
        });
    });
    tableService.notifySubscribers(tableId);

    return {
        outcome: IOperationOutcome.success,
        result: undefined
    };
};
