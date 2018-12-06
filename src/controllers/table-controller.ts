import playerService from '../services/player-service';
import tableService from '../services/table-service';
import { noTableJoined, serializeTable } from './shared';

const createVirtualTable = (req: any, res: any, next: any) => {
    const tableId = req.session.tableId = tableService.createVirtualTable();
    return res.send(JSON.stringify({ tableId }));
};

const exitTable = (req: any, res: any, next: any) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId;
    tableService.removePlayer(tableId, playerId);
    delete req.session.tableId;
    return res.status(200).send(JSON.stringify({ message: 'Successfully exited table' }));
};

const exitVirtualTable = (req: any, res: any, next: any) => {
    const tableId = req.session.tableId;
    tableService.deleteVirtualTable(tableId);
    delete req.session.tableId;
    return res.status(200).send(JSON.stringify({ message: 'Successfully exited virtual table' }));
};

const getTableStatus = (req: any, res: any, next: any) => {
    const table = tableService.getTableById(req.session.tableId);
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
    const table = tableService.getVirtualTableById(req.session.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        return serializeTable(res, table);
    }
};

const joinTable = (req: any, res: any, next: any) => {
    const playerId = req.session.playerId;
    const player = playerService.getPlayerById(playerId);
    if (!player) {
        throw 'No player identified by ' + playerId + ' was found';
    }
    playerService.setInactiveRounds(player, 0);

    const table = tableService.getAvailableTable();
    tableService.addPlayer(table, player);
    req.session.tableId = table.id;
    return res.send(JSON.stringify({ tableId: table.id }));
};

export {
    createVirtualTable,
    exitTable,
    exitVirtualTable,
    getVirtualTableStatus,
    getTableStatus,
    joinTable
};

export default {
    createVirtualTable,
    exitTable,
    exitVirtualTable,
    getVirtualTableStatus,
    getTableStatus,
    joinTable
};