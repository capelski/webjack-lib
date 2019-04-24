import { orchestrationService, tableService } from 'webjack-core';
import { noTableJoined } from './shared';

export const exitTable = (req: any, res: any) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId;
    tableService.removePlayer(tableId, playerId);
    delete req.session.tableId;
    return res.status(200).send();
};

export const getTableStatus = (req: any, res: any) => {
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
            table.baseTimestamp = Date.now();
            return res.status(200).send(JSON.stringify({
                baseTimestamp: table.baseTimestamp,
                dealer: table.dealer,
                id: table.id,
                isRoundBeingPlayed: table.isRoundBeingPlayed,
                nextActionTimestamp: table.nextActionTimestamp,
                players: table.players
            }));
        }
    }
};

export const joinTable = (req: any, res: any) => {
    const playerId = req.session.playerId;
    const table = orchestrationService.joinTable(playerId);
    req.session.tableId = table.id;
    return res.status(200).send(JSON.stringify({ tableId: table.id }));
};