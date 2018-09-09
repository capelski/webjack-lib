const { express } = require('modena');
const router = express.Router();
const path = require('path');
const playerService = require('./services/player-service');
const tableService = require('./services/table-service');
const orchestrationService = require('./services/orchestration-service');

const corsMiddleware = (req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};

const configureRouter = (middleware) => {

	const appMiddleware = [ middleware.session, corsMiddleware ];

	const noTableJoined = (res) =>
		res.status(400).send(JSON.stringify({ message: 'No table has been joined' }));

	const getSecondsLeft = (date) => {
		let seconds = -1;
		if (date) {
			const diff = date.getTime() - new Date().getTime();
			if (diff >= 0) {
				seconds = Math.floor(diff / 1000);
			}
		}
		return seconds;
	};

	const serializedTable = (res, table) => res.send(JSON.stringify({
		players: table.players,
		dealer: table.dealer,
		activePlayerId: table.activePlayerId,
		secondsLeft: getSecondsLeft(table.nextAction)
	}));

	router.get('/', function (req, res, next) {	
		return res.sendFile(path.join(__dirname, 'public', 'index.html'));
	});

	router.get('/is-player-registered', appMiddleware, function (req, res, next) {
		const playerId = req.session.playerId;
		const tableId = req.session.tableId;
		return res.send(JSON.stringify({ playerId, tableId }));
	});

	router.get('/register-player', appMiddleware, function (req, res, next) {
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
	});

	router.get('/join-table', appMiddleware, function (req, res, next) {
		const playerId = req.session.playerId;
		const tableId = req.session.tableId = tableService.joinTable(playerId);
		return res.send(JSON.stringify({ tableId }));
	});

	router.get('/table-status', appMiddleware, function (req, res, next) {
		const table = tableService.getTable(req.session.tableId);
		if (!table) {
			return noTableJoined(res);
		}
		else {
			const player = table.players.find(p => p.id == req.session.playerId);

			// TODO Extract max inactive rounds into parameters
			if (player.inactiveRounds > 5) {
				tableService.exitTable(req.session.tableId, req.session.playerId);
				delete req.session.tableId;
				return res.status(400).send(JSON.stringify({ message: 'You have been kicked out due to inactivity' }));
			}
			else {
				return serializedTable(res, table);
			}
		}
	});

	router.get('/place-bet', appMiddleware, function (req, res, next) {
		const table = tableService.getTable(req.session.tableId);
		// TODO Check there is an amount set and is parsable
		const bet = parseInt(req.query.bet);
		if (!table) {
			return noTableJoined(res);
		}
		else {
			orchestrationService.placeBet(table, req.session.playerId, bet);
            return serializedTable(res, table);
		}
	});

	router.get('/make-decision', appMiddleware, function (req, res, next) {
		const playerId = req.session.playerId;
		const decision = req.query.decision;
		const table = tableService.getTable(req.session.tableId);
		if (!table) {
			return noTableJoined(res);
		}
		else {
			try {
				orchestrationService.makeDecision(table, playerId, decision);
				return serializedTable(res, table);
			}
            catch(exception) {
				return res.status(400).send(JSON.stringify({ message: exception }))
			}
		}
    });

	router.get('/exit-table', appMiddleware, function (req, res, next) {
		const playerId = req.session.playerId;
		const tableId = req.session.tableId;
		tableService.exitTable(tableId, playerId);
		delete req.session.tableId;
		return res.status(200).send(JSON.stringify({ message: 'Successfully exited table' }));
	});

	return router;
}

module.exports = { configureRouter };
