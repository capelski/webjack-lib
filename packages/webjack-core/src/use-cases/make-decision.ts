import { getNextCard } from '../services/card-set-service';
import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';
import { PlayerActions } from '../types/player-actions';
import { TableStatus } from '../types/table-status';
import { updateCurrentRound } from './update-current-round';

export const makeDecision = (
    tableId: string,
    playerId: string,
    decision: PlayerActions
): IOperationResult<undefined> => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            error: 'No table identified by ' + tableId + ' was found',
            outcome: IOperationOutcome.error
        };
    }

    if (table.status !== TableStatus.PlayerTurns) {
        return {
            error: 'Not allowed to update the current round now',
            outcome: IOperationOutcome.error
        };
    }

    const player = tableService.getCurrentPlayer(table)!;
    if (player.id !== playerId) {
        return {
            error: 'You are not allowed to make a decision now',
            outcome: IOperationOutcome.error
        };
    }

    const currentHand = playerService.getCurrentHand(player)!;

    switch (decision) {
        case PlayerActions.Double: {
            if (!handService.canDouble(currentHand)) {
                return {
                    error: 'Doubling is only allowed with 9, 10 or 11 points',
                    outcome: IOperationOutcome.error
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
                    error: 'Splitting is only allowed with two equal cards!',
                    outcome: IOperationOutcome.error
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
                error: 'Action not supported',
                outcome: IOperationOutcome.error
            };
    }
    tableService.notifySubscribers(tableId);
    tableService.clearNextAction(table);
    updateCurrentRound(tableId);

    return {
        outcome: IOperationOutcome.success,
        result: undefined
    };
};
