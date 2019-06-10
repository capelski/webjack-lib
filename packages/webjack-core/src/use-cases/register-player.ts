import * as playerService from '../services/player-service';
import { IOperationOutcome, IOperationResult } from '../types/operation-result';
import { IPlayer } from '../types/player';

export const registerPlayer = (playerName: string): IOperationResult<IPlayer> => {
    if (!playerName || !playerName.trim()) {
        return {
            error: 'No player name was provided',
            outcome: IOperationOutcome.error
        };
    }
    playerName = playerName.trim();

    if (playerName.toLowerCase() === 'dealer') {
        return {
            error: 'So you think you are funny, huh? Choose another name',
            outcome: IOperationOutcome.error
        };
    }

    const existingPlayer = playerService.getPlayerByName(playerName);
    if (existingPlayer) {
        return {
            error: playerName + ' is already taken. Please choose another name',
            outcome: IOperationOutcome.error
        };
    }

    const player = playerService.createPlayer(playerName);
    return {
        outcome: IOperationOutcome.success,
        result: player
    };
};
