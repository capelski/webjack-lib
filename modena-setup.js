const { configureEndpoints } = require('modena');
const { join } = require('path');
const playerController = require('./controllers/player-controller');
const tableController = require('./controllers/table-controller');
const gameController = require('./controllers/game-controller');

const corsMiddleware = (req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};

module.exports = configureEndpoints((router, config, middleware) => {

	const appMiddleware = [ middleware.session, corsMiddleware ];

	if (config.ENABLE_DEVELOPMENT_MODE && config.developmentCardsSet) {
		const tableService = require('./services/table-service');
		tableService.useDevelopmentCardsSet(config.developmentCardsSet);
	}

	router.get('/', (req, res, next) =>	
		res.sendFile(join(__dirname, 'webjack-ui', 'dist', 'index.html')));

	router.get('/is-player-registered', appMiddleware, playerController.isPlayerRegistered);
	router.get('/register-player', appMiddleware, playerController.registerPlayer);
	router.get('/join-table', appMiddleware, tableController.joinTable);
	router.get('/table-status', appMiddleware, tableController.getTableStatus);
	router.get('/place-bet', appMiddleware, gameController.placeBet);
	router.get('/make-decision', appMiddleware, gameController.makeDecision);
	router.get('/exit-table', appMiddleware, tableController.exitTable);
});
