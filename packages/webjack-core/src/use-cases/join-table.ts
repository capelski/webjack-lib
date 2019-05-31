import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { UseCaseResult } from '../types/use-case-result';

export const joinTable = (playerId: string): UseCaseResult => {
    const player = playerService.getPlayerById(playerId);
    if (!player) {
        return {
            ok: false,
            error: 'No player identified by ' + playerId + ' was found'
        };
    }
    playerService.resetInactiveRounds(player);

    const table = tableService.getAvailableTable();
    tableService.addPlayer(table, player);
    return {
        ok: true,
        result: table
    };
}