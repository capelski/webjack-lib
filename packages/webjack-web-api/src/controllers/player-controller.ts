import { playerService } from 'webjack-core';

export const isPlayerRegistered = (req: any, res: any) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId;
    return res.send(JSON.stringify({ playerId, tableId }));
};

export const registerPlayer = (req: any, res: any) => {
    if (!req.session.playerId) {
        try {
            const player = playerService.createPlayer(req.query.name);
            req.session.playerId = player.id;
        }
        catch (exception) {
            return res.status(400).send(JSON.stringify({ message: exception }));
        }
    }
    
    return res.send(JSON.stringify({ playerId: req.session.playerId }));
};