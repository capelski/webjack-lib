import { orchestrationService, tableService } from 'webjack-core';
import { noTableJoined } from './shared';
import { Request, Response } from 'express';

export const exitTable = (req: Request, res: Response) => {
    const playerId = req.session!.playerId;
    const tableId = req.session!.tableId;
    tableService.removePlayer(tableId, playerId);
    delete req.session!.tableId;
    return res.status(200).send(JSON.stringify({}));
};

export const getTableStatus = (req: Request, res: Response) => {
    const table = tableService.getTableById(req.session!.tableId);
    if (!table) {
        return noTableJoined(res);
    }
    else {
        const player = table.players.find(p => p.id == req.session!.playerId);

        if (!player) {
            delete req.session!.tableId;
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

export const joinTable = (req: Request, res: Response) => {
    const playerId = req.session!.playerId;
    const table = orchestrationService.joinTable(playerId);
    req.session!.tableId = table.id;
    return res.status(200).send(JSON.stringify({ tableId: table.id }));
};