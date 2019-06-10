import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { IUseCaseResult } from '../types/use-case-result';

export const exitTable = (tableId: string, playerId: string): IUseCaseResult => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            error: 'No table identified by ' + tableId + ' was found',
            ok: false
        };
    }

    const player = tableService.getPlayerById(table, playerId);
    if (!player) {
        return {
            error: 'No player identified by ' + playerId + ' was found',
            ok: false
        };
    }

    if (playerService.isPlaying(player)) {
        return {
            error: 'Wait to finish the current round before leaving the table',
            ok: false
        };
    }

    tableService.removePlayer(table, playerId);
    tableService.notifySubscribers(tableId);

    return {
        ok: true
    };
};
