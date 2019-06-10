import { Request, Response } from 'express';
import { types, useCases } from 'webjack-core';

export const registerPlayer = (req: Request, res: Response) => {
    if (req.session!.playerId) {
        return res.status(400).send(JSON.stringify({ message: 'You have already registered' }));
    }

    const playerName = req.query.name;
    const operationResult = useCases.registerPlayer(playerName);
    if (operationResult.outcome === types.IOperationOutcome.success) {
        req.session!.playerId = operationResult.result.id;
        res.status(200).send(JSON.stringify({ playerId: operationResult.result.id }));
    } else {
        res.status(400).send(JSON.stringify({ message: operationResult.error }));
    }
};
