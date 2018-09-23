const playerService = require('../services/player-service');

const isPlayerRegistered = (req, res, next) => {
    const playerId = req.session.playerId;
    const tableId = req.session.tableId;
    return res.send(JSON.stringify({ playerId, tableId }));
};

const registerPlayer = (req, res, next) => {
    if (!req.session.playerId) {
        try {
            const player = playerService.create(req.query.name);
            req.session.playerId = player.id;
        }
        catch (exception) {
            return res.status(400).send(JSON.stringify({ message: exception }));
        }
    }
    
    return res.send(JSON.stringify({ playerId: req.session.playerId }));
};

module.exports = {
    isPlayerRegistered,
    registerPlayer
};
