var express = require('express');
var router = express.Router();
var path = require('path');
const gameService = require('./services/game-service');
const uuidV4 = require('uuid/v4');

const configureRouter = (middleware) => {
	router.get('/', function (req, res, next) {
		res.render('index.ejs');
	});

	router.get('/create', middleware.session, function (req, res, next) {
		var gameId = gameService.create();
		var playerId = uuidV4();
		return res.send(JSON.stringify({ gameId, playerId }));
	});

	router.get('/join', middleware.session, function (req, res, next) {
		var gameId = parseInt(req.query.gameId);
		var game = gameService.joinGame(gameId);
		var playerId = uuidV4();
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

	// TODO makeDecision endpoint (receiving the action as parameter)

	router.get('/hit', middleware.session, function (req, res, next) {

		// TODO Pass the playerId as parameter (should be some kind of hash)
		var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
			var playerId = gameService.getCurrentPlayer(game).id;
        	gameService.makeDecision(game, playerId, 'Hit');
            return res.send(JSON.stringify(game.playerSet));
		}
    });

    router.get('/double', middleware.session, function (req, res, next) {

    	// TODO Pass the playerId as parameter (should be some kind of hash)
		var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
			var playerId = gameService.getCurrentPlayer(game).id;
        	gameService.makeDecision(game, playerId, 'Double');
            return res.send(JSON.stringify(game.playerSet));
		}
    });

    router.get('/split', middleware.session, function (req, res, next) {

        // TODO Pass the playerId as parameter (should be some kind of hash)
		var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
			var playerId = gameService.getCurrentPlayer(game).id;
        	gameService.makeDecision(game, playerId, 'Split');
            return res.send(JSON.stringify(game.playerSet));
		}
    });

    router.get('/stand', middleware.session, function (req, res, next) {
        // TODO Pass the playerId as parameter (should be some kind of hash)
		var gameId = parseInt(req.query.gameId);
		var game = gameService.getGame(gameId);
		if (!game) {
			return res.send(JSON.stringify({message: "No game created"}));
		}
		else {
			var playerId = gameService.getCurrentPlayer(game).id;
        	gameService.makeDecision(game, playerId, 'Stand');
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
