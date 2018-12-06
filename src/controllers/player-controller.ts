import playerService from '../services/player-service';
import tableService from '../services/table-service';

const isPlayerRegistered = (req: any, res: any, next: any) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId;
    const isVirtualTable = !!tableService.getVirtualTableById(tableId);
    return res.send(JSON.stringify({ playerId, tableId, isVirtualTable }));
};

const registerPlayer = (req: any, res: any, next: any) => {
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

export {
    isPlayerRegistered,
    registerPlayer
};

export default {
    isPlayerRegistered,
    registerPlayer
};
