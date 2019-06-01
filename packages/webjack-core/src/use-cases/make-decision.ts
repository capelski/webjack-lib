import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { PlayerActions } from '../types/player-actions';
import { getNextCard } from '../services/card-set-service';
import { TableStatus } from '../types/table-status';
import { UseCaseResult } from '../types/use-case-result';
import { updateCurrentRound } from './update-current-round';

export const makeDecision = (tableId: string, playerId: string, decision: PlayerActions): UseCaseResult => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            ok: false,
            error: 'No table identified by ' + tableId + ' was found'
        };
    }

    if (table.status !== TableStatus.PlayerTurns) {
        return {
            ok: false,
            error: 'Not allowed to update the current round now'
        };
    }

    const player = tableService.getCurrentPlayer(table)!;
    if (player.id !== playerId) {
        return {
            ok: false,
            error: 'You are not allowed to make a decision now'
        };
    }

    const currentHand = playerService.getCurrentHand(player)!;
    
    switch (decision) {
        case PlayerActions.Double: {
            if (!handService.canDouble(currentHand)) {
                return {
                    ok: false,
                    error: 'Doubling is only allowed with 9, 10 or 11 points',
                };
            }
            playerService.double(player, getNextCard(table.cardSet));
            break;
        }
        case PlayerActions.Hit: {
            playerService.hit(player, getNextCard(table.cardSet));
            break;
        }
        case PlayerActions.Split: {
            if (!handService.canSplit(currentHand)) {
                return {
                    ok: false,
                    error: 'Splitting is only allowed with two equal cards!',
                };
            }
            playerService.split(player, getNextCard(table.cardSet));
            break;
        }
        case PlayerActions.Stand: {
            playerService.stand(player);
            break;
        }
        default:
            return {
                ok: false,
                error: 'Action not supported',
            };
    }
    tableService.clearNextAction(table);
    updateCurrentRound(tableId);

    return {
        ok: true
    };
};
