import { getNextCard } from '../services/card-set-service';
import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { HandStatus } from '../types/hand-status';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';
import { TableStatus } from '../types/table-status';
import { playDealerTurn } from './play-dealer-turn';

export const updateCurrentRound = (tableId: string): IOperationResult<undefined> => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            error: 'No table identified by ' + tableId + ' was found',
            outcome: IOperationOutcome.error
        };
    }

    if (table.status !== TableStatus.PlayerTurns) {
        return {
            error: 'Not allowed to update the current round now',
            outcome: IOperationOutcome.error
        };
    }

    const currentPlayer = tableService.getCurrentPlayer(table);
    if (currentPlayer) {
        const currentHand = playerService.getCurrentHand(currentPlayer)!;

        if (handService.hasBeenSplit(currentHand)) {
            handService.addCard(currentHand, getNextCard(table.cardSet));
            tableService.notifySubscribers(tableId);
        }

        // After dealing the card to the split hand, the current hand might be a BlackJack
        if (currentHand.status === HandStatus.BlackJack) {
            updateCurrentRound(tableId);
        } else {
            tableService.setNextAction(table, 20, () => {
                playerService.stand(currentPlayer);
                updateCurrentRound(tableId);
            });
            tableService.notifySubscribers(tableId);
        }
    } else {
        tableService.setStatus(table, TableStatus.DealerTurn);
        tableService.setNextAction(table, 3, () => playDealerTurn(tableId));
        tableService.notifySubscribers(tableId);
    }

    return {
        outcome: IOperationOutcome.success,
        result: undefined
    };
};
