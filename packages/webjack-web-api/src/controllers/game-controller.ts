import { orchestrationService, tableService } from 'webjack-core';
import { noTableJoined } from './shared';
import { Request, Response } from 'express';

export const makeDecision = (req: Request, res: Response) => {
    const playerId = req.session!.playerId;
    const decision = req.query.decision;
    const table = tableService.getTableById(req.session!.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        try {
            orchestrationService.makeDecision(table, playerId, decision);
            return res.status(200).send(JSON.stringify({}));
        }
        catch(exception) {
            return res.status(400).send(JSON.stringify({ message: exception }))
        }
    }
};

export const placeBet = (req: Request, res: Response) => {
    const table = tableService.getTableById(req.session!.tableId);
    const bet = parseInt(req.query.bet);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        orchestrationService.placeBet(table, req.session!.playerId, bet);
        return res.status(200).send(JSON.stringify({}));
    }
};