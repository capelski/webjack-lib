import * as playerController from './controllers/player-controller';
import * as tableController from './controllers/table-controller';
import * as gameController from './controllers/game-controller';
import { GameParameters, gameParametersService, Card, cardSetService } from 'webjack-core';
import { Router, Application } from 'express';

export const exposeWebjackRoutes = (app: Application | Router, routesPrefix = '') => {
	app.get(`${routesPrefix}/is-player-registered`, playerController.isPlayerRegistered);
	app.get(`${routesPrefix}/register-player`, playerController.registerPlayer);
	app.get(`${routesPrefix}/join-table`, tableController.joinTable);
	app.get(`${routesPrefix}/table-status`, tableController.getTableStatus);
	app.get(`${routesPrefix}/place-bet`, gameController.placeBet);
	app.get(`${routesPrefix}/make-decision`, gameController.makeDecision);
	app.get(`${routesPrefix}/exit-table`, tableController.exitTable);
};

export const setGameParameters = (gameParameters: GameParameters) =>
	gameParametersService.setParameters(gameParameters);

export const useDevelopmentCardSet = (developmentCardSet: Card[]) =>
	cardSetService.useDevelopmentCards(developmentCardSet);