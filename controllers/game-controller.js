const orchestrationService = require('../services/orchestration-service');
const tableService = require('../services/table-service');
const { noTableJoined, serializeTable } = require('./shared');

const makeDecision = (req, res, next) => {
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

const makeVirtualDecision = (req, res, next) => {
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

const placeBet = (req, res, next) => {
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

const startVirtualRound = (req, res, next) => {
    const bet = parseInt(req.query.bet);
    const table = tableService.getVirtualTable(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        table.players.forEach(player =>
            orchestrationService.placeBet(table, player.id, bet));
        return serializeTable(res, table);
    }
}

module.exports = {
    makeDecision,
    makeVirtualDecision,
    placeBet,
    startVirtualRound,
};