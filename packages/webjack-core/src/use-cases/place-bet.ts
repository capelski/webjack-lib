import { initializeHand } from '../services/player-service';
import * as tableService from '../services/table-service';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';
import { TableStatus } from '../types/table-status';
import { startRound } from './start-round';

export const placeBet = (
    tableId: string,
    playerId: string,
    bet = 1
): IOperationResult<undefined> => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            error: 'No table identified by ' + tableId + ' was found',
            outcome: IOperationOutcome.error
        };
    }

    const player = tableService.getPlayerById(table, playerId);
    if (!player) {
        return {
            error: 'No player identified by ' + playerId + ' was found',
            outcome: IOperationOutcome.error
        };
    }

    if (table.status !== TableStatus.Idle && table.status !== TableStatus.PlacingBets) {
        return {
            error: "Bets can't be placed once a round has been started",
            outcome: IOperationOutcome.error
        };
    }

    initializeHand(player, bet);
    tableService.setStatus(table, TableStatus.PlacingBets);

    if (!table.nextAction) {
        tableService.setNextAction(table, 7, () => startRound(tableId));
    }
    tableService.notifySubscribers(tableId);

    return {
        outcome: IOperationOutcome.success,
        result: undefined
    };
};
