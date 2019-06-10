import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';

export const exitTable = (tableId: string, playerId: string): IOperationResult<undefined> => {
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

    if (playerService.isPlaying(player)) {
        return {
            error: 'Wait to finish the current round before leaving the table',
            outcome: IOperationOutcome.error
        };
    }

    tableService.removePlayer(table, playerId);
    tableService.notifySubscribers(tableId);

    return {
        outcome: IOperationOutcome.success,
        result: undefined
    };
};
