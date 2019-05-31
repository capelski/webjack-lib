import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { getNextCard } from '../services/card-set-service';
import { endRound } from './end-round';
import { UseCaseResult } from '../types/use-case-result';

export const playDealerTurn = (tableId: string): UseCaseResult => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            ok: false,
            error: 'No table identified by ' + tableId + ' was found'
        };
    }

    tableService.clearNextAction(table);

    const dealerHand = playerService.getCurrentHand(table.dealer)!;
    let dealerHandValue = 0;

    const dealerInterval = setInterval(() => {
        if (dealerHandValue < 17) {
            handService.addCard(dealerHand, getNextCard(table.cardSet));
            dealerHandValue = handService.getValue(dealerHand);
        }
        else {
            clearInterval(dealerInterval);
            handService.markAsPlayed(dealerHand);
            endRound(table.id);
        }
    }, 1000);

    return {
        ok: true,
    };
};