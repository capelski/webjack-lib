import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { getNextCard } from '../services/card-set-service';
import { TableStatus } from '../types/table-status';
import { UseCaseResult } from '../types/use-case-result';
import { endRound } from './end-round';

export const playDealerTurn = (tableId: string): UseCaseResult => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            ok: false,
            error: 'No table identified by ' + tableId + ' was found'
        };
    }

    if (table.status !== TableStatus.DealerTurn) {
        return {
            ok: false,
            error: 'Dealer turn can\'t be played now'
        };
    }

    tableService.clearNextAction(table);

    const dealerHand = playerService.getCurrentHand(table.dealer)!;
    let dealerHandValue = 0;

    const dealerInterval = setInterval(() => {
        if (dealerHandValue < 17) {
            handService.addCard(dealerHand, getNextCard(table.cardSet));
            tableService.notifySubscribers(tableId);
            dealerHandValue = handService.getValue(dealerHand);
        }
        else {
            clearInterval(dealerInterval);
            tableService.setStatus(table, TableStatus.EndingRound);
            endRound(table.id);
        }
    }, 1000);

    return {
        ok: true,
    };
};