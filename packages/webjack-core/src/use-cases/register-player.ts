import * as playerService from '../services/player-service';
import { IUseCaseResult } from '../types/use-case-result';

export const registerPlayer = (playerName: string): IUseCaseResult => {
    if (!playerName || !playerName.trim()) {
        return {
            error: 'No player name was provided',
            ok: false
        };
    }
    playerName = playerName.trim();

    if (playerName.toLowerCase() === 'dealer') {
        return {
            error: 'So you think you are funny, huh? Choose another name',
            ok: false
        };
    }

    const existingPlayer = playerService.getPlayerByName(playerName);
    if (existingPlayer) {
        return {
            error: playerName + ' is already taken. Please choose another name',
            ok: false
        };
    }

    const player = playerService.createPlayer(playerName);
    return {
        ok: true,
        result: player
    };
};
