import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { IUseCaseResult } from '../types/use-case-result';

export const joinTable = (playerId: string): IUseCaseResult => {
    const player = playerService.getPlayerById(playerId);
    if (!player) {
        return {
            error: 'No player identified by ' + playerId + ' was found',
            ok: false
        };
    }
    playerService.resetInactiveRounds(player);

    const table = tableService.getAvailableTable();
    tableService.addPlayer(table, player);
    tableService.notifySubscribers(table.id);

    return {
        ok: true,
        result: table
    };
};
