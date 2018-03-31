var express = require('express');
var router = express.Router();
var path = require('path');
const tableService = require('./services/table-service');
const uuidV4 = require('uuid/v4');

const configureRouter = (middleware) => {

	const noTableJoined = (res) =>
		res.status(400).send(JSON.stringify({message: "No table has been joined"}));

	const serializedTable = (res, table) => res.send(JSON.stringify(table.playerSet));

	router.get('/', middleware.session, function (req, res, next) {
		var playerId = req.session.playerId;
		if (!playerId) {
			playerId = req.session.playerId = uuidV4();
		}

		var tableId = req.session.tableId;
		res.render('index.ejs', { playerId, tableId });
	});

	router.get('/join', middleware.session, function (req, res, next) {
		var playerId = req.session.playerId;
		var tableId = tableService.joinTable(playerId);
		req.session.tableId = tableId;
		return res.send(tableId);
	});

	router.get('/get', middleware.session, function (req, res, next) {
		var table = tableService.getTable(req.session.tableId);
		if (!table) {
			return noTableJoined(res);
		}
		else {
			return serializedTable(res, table);
		}
	});

	router.get('/start-round', middleware.session, function (req, res, next) {
		var table = tableService.getTable(req.session.tableId);
		if (!table) {
			return noTableJoined(res);
		}
		else {
			tableService.startRound(table);
            return serializedTable(res, table);
		}
	});

	router.get('/make-decision', middleware.session, function (req, res, next) {

		var playerId = req.session.playerId;
		var decision = req.query.decision;
		var table = tableService.getTable(req.session.tableId);
		if (!table) {
			return noTableJoined(res);
		}
		else {
			try {
				tableService.makeDecision(table, playerId, decision);
				return serializedTable(res, table);
			}
            catch(exception) {
				return res.status(400).send(exception);
			}
		}
    });

    router.get('/end-round', middleware.session, function (req, res, next) {
		var table = tableService.getTable(req.session.tableId);
		if (!table) {
			return noTableJoined(res);
		}
		else {
        	tableService.endRound(table);
            return serializedTable(res, table);
		}
    });

    router.get('/clear-round', middleware.session, function (req, res, next) {
		var table = tableService.getTable(req.session.tableId);
		if (!table) {
			return noTableJoined(res);
		}
		else {
        	tableService.collectPlayedCards(table);
            return serializedTable(res, table);
		}
    });

	return router;
}

module.exports = { configureRouter };
