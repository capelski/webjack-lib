'use strict';

let js = require('../utils/js-generics');
let Game = require('../models/game');
let cardSetService = require('./card-set-service');
let playerService = require('./player-service');
let playerSetService = require('./player-set-service');
let rulesService = require('./rules-service');

let games = [];

function gameService() {

    function clearRound(game) {
        var playedCards = [];

        js.iterate(game.playerSet.players, (player) => {
            playedCards = playedCards.concat(playerService.clearRound(player));
        });
        cardSetService.addPlayedCards(game.cardSet, playedCards);
        
        if (game.cardSet.playedCards.length > 80) {
            cardSetService.refill(game.cardSet);
        }
    }

    function create(ownerId, cardSet, playerSet) {
        cardSet = cardSet || cardSetService.create();        
        playerSet = playerSet || playerSetService.create(ownerId);

        var game = new Game(cardSet, playerSet);
        games.push(game);

        return games.length - 1;
    }

    function endRound(game) {
        if (playerSetService.getCurrentPlayer(game.playerSet).id !== playerSetService.getDealer(game.playerSet).id) {
            throw 'Can\'t play dealer round yet!';
        }
        
        var dealerScore = rulesService.dealerTurn(game);

        js.iterate(game.playerSet.players, (player, key) => {            
            if (player !== playerSetService.getDealer(game.playerSet)) {
                rulesService.resolve(player, dealerScore);
            }
        });

        playerSetService.endRound(game.playerSet);
    }

    function getCurrentPlayer(game) {
        return playerSetService.getCurrentPlayer(game.playerSet);
    }

    function getGame(gameId) {
        return games[gameId];
    }

    function joinGame(gameId, playerId) {
        var game = games[gameId];
        if (!game) {
            throw 'No game identified by ' + gameId + ' was found';
        }

        playerSetService.addPlayer(game.playerSet, playerId);

        return game;
    }

    function makeDecision(game, playerId, action) {
        var player = playerSetService.ensurePlayer(game.playerSet, playerId);
        switch (action) {
            case 'Double': {
                rulesService.double(game, player);
                break;
            }
            case 'Hit': {
                rulesService.hit(game, player);
                break;
            }
            case 'Split': {
                rulesService.split(game, player);
                break;
            }
            case 'Stand': {
                rulesService.stand(game, player);
                break;
            }
        }
        playerService.addAction(player, action);
    }

    function startRound(game) {
        js.iterate(game.playerSet.players, (player) => {            
            playerService.startRound(player);
            rulesService.dealCard(game, player, true);
        });

        js.iterate(game.playerSet.players, (player) => {
            if (player !== playerSetService.getDealer(game.playerSet)) {
                rulesService.dealCard(game, player, true);
            }
        });

        playerSetService.startRound(game.playerSet);
    }

    function stringify(game) {
        return playerSetService.stringify(game.playerSet);
    }

    return {
        clearRound,
        create,
        endRound,
        getCurrentPlayer,
        getGame,
        joinGame,
        makeDecision,
        startRound,
        stringify
    };
}

module.exports = gameService();
