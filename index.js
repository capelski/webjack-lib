var express = require('express');
var router = express.Router();
var path = require('path');
const gameService = require('./services/game-service');
const uuidV4 = require('uuid/v4');

const configureRouter = (middleware) => {
	router.get('/', function (req, res, next) {
		res.render('index.ejs');
	});

	// TODO Instead of getting the playerId by parameter, set it by session

	router.get('/create', middleware.session, function (req, res, next) {
		var playerId = uuidV4();
		var gameId = gameService.create(playerId);
		return res.send(JSON.stringify({ gameId, playerId }));
	});

	router.get('/join', middleware.session, function (req, res, next) {
		var gameId = parseInt(req.query.gameId);
		var playerId = uuidV4();
		var game = gameService.joinGame(gameId, playerId);
		return res.send(playerId);
	});

	router.get('/get', middleware.session, function (req, res, next) {
		var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
			return res.send(JSON.stringify(game.playerSet));
		}
	});

	router.get('/start-round', middleware.session, function (req, res, next) {
		var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
			gameService.startRound(game);
            return res.send(JSON.stringify(game.playerSet));
		}
	});

	router.get('/make-decision', middleware.session, function (req, res, next) {

		var gameId = parseInt(req.query.gameId);
		var playerId = req.query.playerId;
		var decision = req.query.decision;
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
        	gameService.makeDecision(game, playerId, decision);
            return res.send(JSON.stringify(game.playerSet));
		}
    });

    router.get('/end-round', middleware.session, function (req, res, next) {
    	var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
        	gameService.endRound(game);
            return res.send(JSON.stringify(game.playerSet));
		}
    });

    router.get('/clear-round', middleware.session, function (req, res, next) {
    	var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
        	gameService.clearRound(game);
            return res.send(JSON.stringify(game.playerSet));
		}
    });

	return router;
}

module.exports = { configureRouter };
