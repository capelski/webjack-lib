import { collectPlayedCards } from '../services/card-set-service';
import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { TableStatus } from '../types/table-status';
import { IUseCaseResult } from '../types/use-case-result';

export const endRound = (tableId: string): IUseCaseResult => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            error: 'No table identified by ' + tableId + ' was found',
            ok: false
        };
    }

    if (table.status !== TableStatus.EndingRound) {
        return {
            error: "Round can't be ended now",
            ok: false
        };
    }

    const dealerHand = table.dealer.hands[0];
    const activePlayers = tableService.getActivePlayers(table);
    activePlayers.forEach(player => {
        const handsEarnings = player.hands.map(hand => {
            const handEarnings = handService.resolveHand(hand, dealerHand);
            handService.clearBet(hand);
            return handEarnings;
        });
        const earningRate = handsEarnings.reduce((x, y) => x + y, 0);
        playerService.updateEarningRate(player, earningRate);
    });

    tableService.setNextAction(table, 5, () => {
        tableService.clearNextAction(table);
        collectPlayedCards(table.cardSet);
        activePlayers.forEach(playerService.clearHands);
        playerService.clearHands(table.dealer);
        tableService.setStatus(table, TableStatus.Idle);
        tableService.notifySubscribers(tableId);
    });
    tableService.notifySubscribers(tableId);

    return {
        ok: true
    };
};
