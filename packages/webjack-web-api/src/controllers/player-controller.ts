import { useCases } from 'webjack-core';
import { Request, Response } from 'express';

export const registerPlayer = (req: Request, res: Response) => {
    if (req.session!.playerId) {
        return res.status(400).send(JSON.stringify({ message: 'You have already registered' }));
    }

    const playerName = req.query.name;
    const useCaseResult = useCases.registerPlayer(playerName);
    if (useCaseResult.ok) {
        req.session!.playerId = useCaseResult.result!.id;
        res.status(200).send(JSON.stringify({ playerId: useCaseResult.result!.id }));
    }
    else {
        res.status(400).send(JSON.stringify({ message: useCaseResult.error }));
    }
};