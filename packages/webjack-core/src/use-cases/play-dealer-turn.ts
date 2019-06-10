import { getNextCard } from '../services/card-set-service';
import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';
import { TableStatus } from '../types/table-status';
import { endRound } from './end-round';

export const playDealerTurn = (tableId: string): IOperationResult<undefined> => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            error: 'No table identified by ' + tableId + ' was found',
            outcome: IOperationOutcome.error
        };
    }

    if (table.status !== TableStatus.DealerTurn) {
        return {
            error: "Dealer turn can't be played now",
            outcome: IOperationOutcome.error
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
        } else {
            clearInterval(dealerInterval);
            tableService.setStatus(table, TableStatus.EndingRound);
            endRound(table.id);
        }
    }, 1000);

    return {
        outcome: IOperationOutcome.success,
        result: undefined
    };
};
