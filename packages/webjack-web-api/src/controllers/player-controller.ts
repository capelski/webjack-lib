import { playerService } from 'webjack-core';
import { Request, Response } from 'express';

export const registerPlayer = (req: Request, res: Response) => {
    if (!req.session!.playerId) {
        try {
            const player = playerService.createPlayer(req.query.name);
            req.session!.playerId = player.id;
        }
        catch (exception) {
            return res.status(400).send(JSON.stringify({ message: exception }));
        }
    }
    
    return res.send(JSON.stringify({ playerId: req.session!.playerId }));
};