import * as playerController from './controllers/player-controller';
import * as tableController from './controllers/table-controller';
import * as gameController from './controllers/game-controller';
import { GameParameters, gameParametersService, Card, cardSetService } from 'webjack-core';

// TODO Import express types
export const exposeWebjackMethods = (router: any, appMiddleware: any[], gameParameters?: GameParameters, developmentCardSet?: Card[]) => {
	if (gameParameters) {
		gameParametersService.setParameters(gameParameters);
	}
	if (developmentCardSet) {
		cardSetService.useDevelopmentCards(developmentCardSet);
	}

	router.get('/is-player-registered', appMiddleware, playerController.isPlayerRegistered);
	router.get('/register-player', appMiddleware, playerController.registerPlayer);
	router.get('/join-table', appMiddleware, tableController.joinTable);
	router.get('/table-status', appMiddleware, tableController.getTableStatus);
	router.get('/place-bet', appMiddleware, gameController.placeBet);
	router.get('/make-decision', appMiddleware, gameController.makeDecision);
	router.get('/exit-table', appMiddleware, tableController.exitTable);
}
