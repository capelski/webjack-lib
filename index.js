var express = require('express');
var router = express.Router();
var path = require('path');
const tableService = require('./services/table-service');
const uuidV4 = require('uuid/v4');

const configureRouter = (middleware) => {
	router.get('/', function (req, res, next) {
		res.render('index.ejs');
	});

	// TODO Instead of getting the playerId by parameter, set it by session

	router.get('/create', middleware.session, function (req, res, next) {
		var playerId = uuidV4();
		var tableId = tableService.create(playerId);
		return res.send(JSON.stringify({ tableId, playerId }));
	});

	router.get('/join', middleware.session, function (req, res, next) {
		var tableId = parseInt(req.query.tableId);
		var playerId = uuidV4();
		var table = tableService.joinTable(tableId, playerId);
		return res.send(playerId);
	});

	router.get('/get', middleware.session, function (req, res, next) {
		var tableId = parseInt(req.query.tableId);
		var table = tableService.getTable(tableId);
		if (!table) {
			return res.send(JSON.stringify({message: "No table created"}));
		}
		else {
			return res.send(JSON.stringify(table.playerSet));
		}
	});

	router.get('/start-round', middleware.session, function (req, res, next) {
		var tableId = parseInt(req.query.tableId);
		var table = tableService.getTable(tableId);
		if (!table) {
			return res.send(JSON.stringify({message: "No table created"}));
		}
		else {
			tableService.startRound(table);
            return res.send(JSON.stringify(table.playerSet));
		}
	});

	router.get('/make-decision', middleware.session, function (req, res, next) {

		var tableId = parseInt(req.query.tableId);
		var playerId = req.query.playerId;
		var decision = req.query.decision;
		var table = tableService.getTable(tableId);
		if (!table) {
			return res.send(JSON.stringify({message: "No table created"}));
		}
		else {
			try {
				tableService.makeDecision(table, playerId, decision);
				return res.send(JSON.stringify(table.playerSet));
			}
            catch(exception) {
				return res.status(400).send(exception);
			}
		}
    });

    router.get('/end-round', middleware.session, function (req, res, next) {
    	var tableId = parseInt(req.query.tableId);
		var table = tableService.getTable(tableId);
		if (!table) {
			return res.send(JSON.stringify({message: "No table created"}));
		}
		else {
        	tableService.endRound(table);
            return res.send(JSON.stringify(table.playerSet));
		}
    });

    router.get('/clear-round', middleware.session, function (req, res, next) {
    	var tableId = parseInt(req.query.tableId);
		var table = tableService.getTable(tableId);
		if (!table) {
			return res.send(JSON.stringify({message: "No table created"}));
		}
		else {
        	tableService.collectPlayedCards(table);
            return res.send(JSON.stringify(table.playerSet));
		}
    });

	return router;
}

module.exports = { configureRouter };
