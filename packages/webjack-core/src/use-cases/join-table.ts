import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';
import { ITable } from '../types/table';

export const joinTable = (playerId: string): IOperationResult<ITable> => {
    const player = playerService.getPlayerById(playerId);
    if (!player) {
        return {
            error: 'No player identified by ' + playerId + ' was found',
            outcome: IOperationOutcome.error
        };
    }
    playerService.resetInactiveRounds(player);

    const table = tableService.getAvailableTable();
    tableService.addPlayer(table, player);
    tableService.notifySubscribers(table.id);

    return {
        outcome: IOperationOutcome.success,
        result: table
    };
};
