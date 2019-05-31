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
    
    // TODO Extract actions into PlayerService. Reuse
    switch (decision) {
        case PlayerActions.Double: {
            if (!handService.canDouble(currentHand)) {
                return {
                    ok: false,
                    error: 'Doubling is only allowed with 9, 10 or 11 points',
                };
            }
            handService.setBet(currentHand, currentHand.bet * 2);
            playerService.increaseEarningRate(player, -currentHand.bet);
            handService.addCard(currentHand, getNextCard(table.cardSet));
            handService.markAsPlayed(currentHand);
            break;
        }
        case PlayerActions.Hit: {
            handService.addCard(currentHand, getNextCard(table.cardSet));
            break;
        }
        case PlayerActions.Split: {
            if (!handService.canSplit(currentHand)) {
                return {
                    ok: false,
                    error: 'Splitting is only allowed with two equal cards!',
                };
            }
        
            const handLastCard = currentHand.cards.splice(-1)[0];
        
            const newHand = handService.create(currentHand.bet);
            handService.addCard(newHand, handLastCard);
        
            const index = player.hands.findIndex(hand => hand === currentHand);
            player.hands.splice(index + 1, 0, newHand);
        
            handService.addCard(currentHand, getNextCard(table.cardSet));
        
            playerService.increaseEarningRate(player, -currentHand.bet);
            break;
        }
        case PlayerActions.Stand: {
            handService.markAsPlayed(currentHand);
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
