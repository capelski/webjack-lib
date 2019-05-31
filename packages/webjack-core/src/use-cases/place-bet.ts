import { initializeHand } from '../services/player-service';
import * as tableService from '../services/table-service';
import { TableStatus } from '../types/table-status';
import { UseCaseResult } from '../types/use-case-result';
import { startRound } from './start-round';

export const placeBet = (tableId: string, playerId: string, bet = 1): UseCaseResult => {
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

    if (table.status !== TableStatus.Idle && table.status !== TableStatus.PlacingBets) {
        return {
            ok: false,
            error: 'Bets can\'t be placed once a round has been started'
        };
    }

    // TODO Use initializeHand in BasicStrategyTable
    initializeHand(player, bet);
    tableService.setStatus(table, TableStatus.PlacingBets);

    if (!table.nextAction) {
        tableService.setNextAction(table, 7, () => startRound(tableId));
    }
    
    return {
        ok: true
    };
};