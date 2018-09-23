const tableService = require('../services/table-service');
const { noTableJoined, serializeTable } = require('./shared');

const exitTable = (req, res, next) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId;
    tableService.exitTable(tableId, playerId);
    delete req.session.tableId;
    return res.status(200).send(JSON.stringify({ message: 'Successfully exited table' }));
};

const getTableStatus = (req, res, next) => {
    const table = tableService.getTable(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        const player = table.players.find(p => p.id == req.session.playerId);

        // TODO Extract max inactive rounds into parameters
        if (player.inactiveRounds > 5) {
            tableService.exitTable(req.session.tableId, req.session.playerId);
            delete req.session.tableId;
            return res.status(400).send(JSON.stringify({ message: 'You have been kicked out due to inactivity' }));
        }
        else {
            return serializeTable(res, table);
        }
    }
};

const joinTable = (req, res, next) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId = tableService.joinTable(playerId);
    return res.send(JSON.stringify({ tableId }));
};

module.exports = {
    exitTable,
    getTableStatus,
    joinTable
};