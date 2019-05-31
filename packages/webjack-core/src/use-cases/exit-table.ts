import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { UseCaseResult } from '../types/use-case-result';

export const exitTable = (tableId: string, playerId: string): UseCaseResult => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            ok: false,
            error: 'No table identified by ' + tableId + ' was found'
        };
    }

    const player = tableService.getPlayerById(table, playerId);
    if (!player) {
        return {
            ok: false,
            error: 'No player identified by ' + playerId + ' was found'
        };
    }

    if (playerService.isPlaying(player)) {
        return {
            ok: false,
            error: 'Wait to finish the current round before leaving the table'
        };
    }

    tableService.removePlayer(table, playerId);

    return {
        ok: true
    };
}