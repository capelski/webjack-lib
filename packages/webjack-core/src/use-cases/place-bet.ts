import { initializeHand } from '../services/player-service';
import * as tableService from '../services/table-service';
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

    // TODO Use a table Status
    if (table.isRoundBeingPlayed) {
        return {
            ok: false,
            error: 'Bets can only be placed before a round starts'
        };
    }

    // TODO Use initializeHand in BasicStrategyTable
    initializeHand(player, bet);

    if (!table.nextAction) {
        tableService.setNextAction(table, 7, () => startRound(tableId));
    }
    
    return {
        ok: true
    };
};