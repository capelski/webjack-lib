import { orchestrationService, tableService } from 'webjack-core';
import { noTableJoined } from './shared';

export const makeDecision = (req: any, res: any) => {
    const playerId = req.session.playerId;
    const decision = req.query.decision;
    const table = tableService.getTableById(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        try {
            orchestrationService.makeDecision(table, playerId, decision);
            return res.status(200).send();
        }
        catch(exception) {
            return res.status(400).send(JSON.stringify({ message: exception }))
        }
    }
};

export const placeBet = (req: any, res: any) => {
    const table = tableService.getTableById(req.session.tableId);
    const bet = parseInt(req.query.bet);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        orchestrationService.placeBet(table, req.session.playerId, bet);
        return res.status(200).send();
    }
};