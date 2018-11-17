const tableService = require('../services/table-service');
import { noTableJoined, serializeTable } from './shared';

const createVirtualTable = (req: any, res: any, next: any) => {
    const tableId = req.session.tableId = tableService.createVirtualTable();
    return res.send(JSON.stringify({ tableId }));
};

const exitTable = (req: any, res: any, next: any) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId;
    tableService.exitTable(tableId, playerId);
    delete req.session.tableId;
    return res.status(200).send(JSON.stringify({ message: 'Successfully exited table' }));
};

const exitVirtualTable = (req: any, res: any, next: any) => {
    const tableId = req.session.tableId;
    tableService.exitVirtualTable(tableId);
    delete req.session.tableId;
    return res.status(200).send(JSON.stringify({ message: 'Successfully exited virtual table' }));
};

const getTableStatus = (req: any, res: any, next: any) => {
    const table = tableService.getTable(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        const player = table.players.find((p: any) => p.id == req.session.playerId);

        if (!player) {
            delete req.session.tableId;
            return res.status(400).send(JSON.stringify({ message: 'You have been kicked out due to inactivity' }));
        }
        else {
            return serializeTable(res, table);
        }
    }
};

const getVirtualTableStatus = (req: any, res: any, next: any) => {
    const table = tableService.getVirtualTable(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        return serializeTable(res, table);
    }
};

const joinTable = (req: any, res: any, next: any) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId = tableService.joinTable(playerId);
    return res.send(JSON.stringify({ tableId }));
};

export default {
    createVirtualTable,
    exitTable,
    exitVirtualTable,
    getVirtualTableStatus,
    getTableStatus,
    joinTable
};