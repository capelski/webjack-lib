
import * as playerService from '../services/player-service';
import { UseCaseResult } from '../types/use-case-result';

export const registerPlayer = (playerName: string): UseCaseResult => {
    if (!playerName || !playerName.trim()) {
        return {
            ok: false,
            error: 'No player name was provided'
        };
    }
    playerName = playerName.trim();
    
    if (playerName.toLowerCase() === 'dealer') {
        return {
            ok: false,
            error: 'So you think you are funny, huh? Choose another name'
        };
    }

    const existingPlayer = playerService.getPlayerByName(playerName);
    if (existingPlayer) {
        return {
            ok: false,
            error: playerName + ' is already taken. Please choose another name'
        };
    }

    const player = playerService.createPlayer(playerName);
    return {
        ok: true,
        result: player
    };
}