var express = require('express');
var router = express.Router();
var path = require('path');
const tableService = require('./services/table-service');
const uuidV4 = require('uuid/v4');

const configureRouter = (middleware) => {
	router.get('/', middleware.session, function (req, res, next) {
		var playerId = req.session.playerId;
		if (!playerId) {
			playerId = req.session.playerId = uuidV4();
		}

		res.render('index.ejs');
	});

	router.get('/join', middleware.session, function (req, res, next) {
		var playerId = req.session.playerId;
		var tableId = tableService.joinTable(playerId);
		return res.send(tableId);
	});

	router.get('/get', middleware.session, function (req, res, next) {
		var tableId = req.query.tableId;
		var table = tableService.getTable(tableId);
		if (!table) {
			return res.send(JSON.stringify({message: "No table created"}));
		}
		else {
			return res.send(JSON.stringify(table.playerSet));
		}
	});

	router.get('/start-round', middleware.session, function (req, res, next) {
		var tableId = req.query.tableId;
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

		var tableId = req.query.tableId;
		var playerId = req.session.playerId;
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
    	var tableId = req.query.tableId;
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
    	var tableId = req.query.tableId;
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
