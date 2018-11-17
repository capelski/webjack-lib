import orchestrationService from '../services/orchestration-service';
import tableService from '../services/table-service';
import { noTableJoined, serializeTable } from './shared';

const makeDecision = (req: any, res: any, next: any) => {
    const playerId = req.session.playerId;
    const decision = req.query.decision;
    const table = tableService.getTable(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        try {
            orchestrationService.makeDecision(table, playerId, decision);
            return serializeTable(res, table);
        }
        catch(exception) {
            return res.status(400).send(JSON.stringify({ message: exception }))
        }
    }
};

const makeVirtualDecision = (req: any, res: any, next: any) => {
    const decision = req.query.decision;
    const table = tableService.getVirtualTable(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        try {
            orchestrationService.makeVirtualDecision(table, decision);
            return serializeTable(res, table);
        }
        catch(exception) {
            return res.status(400).send(JSON.stringify({ message: exception }))
        }
    }
};

const placeBet = (req: any, res: any, next: any) => {
    const table = tableService.getTable(req.session.tableId);
    const bet = parseInt(req.query.bet);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        orchestrationService.placeBet(table, req.session.playerId, bet);
        return serializeTable(res, table);
    }
};

const startVirtualRound = (req: any, res: any, next: any) => {
    const bet = parseInt(req.query.bet);
    const table = tableService.getVirtualTable(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        table.players.forEach((player: any) =>
            orchestrationService.placeBet(table, player.id, bet));
        return serializeTable(res, table);
    }
}

export {
    makeDecision,
    makeVirtualDecision,
    placeBet,
    startVirtualRound,
};

export default {
    makeDecision,
    makeVirtualDecision,
    placeBet,
    startVirtualRound,
};