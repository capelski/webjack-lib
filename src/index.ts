import modena from 'modena';
import { join } from 'path';
import playerController from './controllers/player-controller';
import tableController from './controllers/table-controller';
import gameController from './controllers/game-controller';

const corsMiddleware = (req: any, res: any, next: any) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};

module.exports = modena.configureEndpoints((router: any, config: any, middleware: any) => {

	const appMiddleware = [ middleware.session, corsMiddleware ];

	if (config.ENABLE_DEVELOPMENT_MODE && config.developmentCardsSet) {
		const cardSetService = require('./services/card-set-service');
		cardSetService.useDevelopmentCards(config.developmentCardsSet);
	}

	router.get('/', (req: any, res: any, next: any) =>	
		res.sendFile(join(__dirname, 'webjack-ui', 'dist', 'index.html')));
		
	router.get('/is-player-registered', appMiddleware, playerController.isPlayerRegistered);
	router.get('/register-player', appMiddleware, playerController.registerPlayer);
	router.get('/join-table', appMiddleware, tableController.joinTable);
	router.get('/table-status', appMiddleware, tableController.getTableStatus);
	router.get('/place-bet', appMiddleware, gameController.placeBet);
	router.get('/make-decision', appMiddleware, gameController.makeDecision);
	router.get('/exit-table', appMiddleware, tableController.exitTable);

	router.get('/join-virtual-table', appMiddleware, tableController.createVirtualTable);
	router.get('/virtual-table-status', appMiddleware, tableController.getVirtualTableStatus);
	router.get('/start-virtual-round', appMiddleware, gameController.startVirtualRound);
	router.get('/make-virtual-decision', appMiddleware, gameController.makeVirtualDecision);
	router.get('/exit-virtual-table', appMiddleware, tableController.exitVirtualTable);
});
