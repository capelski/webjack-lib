import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { getNextCard } from '../services/card-set-service';
import { HandStatus } from '../types/hand-status';
import { TableStatus } from '../types/table-status';
import { UseCaseResult } from '../types/use-case-result';
import { playDealerTurn } from './play-dealer-turn';

export const updateCurrentRound = (tableId: string): UseCaseResult => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            ok: false,
            error: 'No table identified by ' + tableId + ' was found'
        };
    }

    if (table.status !== TableStatus.PlayerTurns) {
        return {
            ok: false,
            error: 'Not allowed to update the current round now'
        };
    }

    const currentPlayer = tableService.getCurrentPlayer(table);
    if (currentPlayer) {
        const currentHand = playerService.getCurrentHand(currentPlayer)!;

        if (handService.hasBeenSplit(currentHand)) {
            handService.addCard(currentHand, getNextCard(table.cardSet));
        }

        // After dealing the card to the split hand, the current hand might be a BlackJack
        if (currentHand.status === HandStatus.BlackJack) {
            updateCurrentRound(tableId);
        }
        else {
            tableService.setNextAction(table, 20, () => {
                playerService.stand(currentPlayer);
                updateCurrentRound(tableId);
            });
        }
    }
    else {
        tableService.setStatus(table, TableStatus.DealerTurn);
        tableService.setNextAction(table, 3, () => playDealerTurn(tableId))
    }

    return {
        ok: true
    };
};