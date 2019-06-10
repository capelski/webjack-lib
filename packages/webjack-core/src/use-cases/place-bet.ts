import { initializeHand } from '../services/player-service';
import * as tableService from '../services/table-service';
import { TableStatus } from '../types/table-status';
import { IUseCaseResult } from '../types/use-case-result';
import { startRound } from './start-round';

export const placeBet = (tableId: string, playerId: string, bet = 1): IUseCaseResult => {
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

    if (table.status !== TableStatus.Idle && table.status !== TableStatus.PlacingBets) {
        return {
            error: "Bets can't be placed once a round has been started",
            ok: false
        };
    }

    initializeHand(player, bet);
    tableService.setStatus(table, TableStatus.PlacingBets);

    if (!table.nextAction) {
        tableService.setNextAction(table, 7, () => startRound(tableId));
    }
    tableService.notifySubscribers(tableId);

    return {
        ok: true
    };
};
