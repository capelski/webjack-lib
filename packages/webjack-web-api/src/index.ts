import { Application, Router } from 'express';
import { services, types } from 'webjack-core';
import * as playerController from './controllers/player-controller';
import * as tableController from './controllers/table-controller';

export const exposeWebjackRoutes = (app: Application | Router, routesPrefix = '') => {
    app.get(`${routesPrefix}/session-data`, (req, res) =>
        res.send(
            JSON.stringify({
                playerId: req.session!.playerId,
                tableId: req.session!.tableId
            })
        )
    );
    app.get(`${routesPrefix}/register-player`, playerController.registerPlayer);
    app.get(`${routesPrefix}/join-table`, tableController.joinTable);
    app.get(`${routesPrefix}/table-status`, tableController.getTableStatus);
    app.get(`${routesPrefix}/place-bet`, tableController.placeBet);
    app.get(`${routesPrefix}/make-decision`, tableController.makeDecision);
    app.get(`${routesPrefix}/exit-table`, tableController.exitTable);
};

export const setGameParameters = (gameParameters: types.IGameParameters) =>
    services.gameParametersService.setParameters(gameParameters);
