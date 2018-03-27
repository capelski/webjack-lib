'use strict';

const js = require('../utils/js-generics');
const Game = require('../models/game');
const cardSetService = require('./card-set-service');
const playerService = require('./player-service');
const playerSetService = require('./player-set-service');
const rulesService = require('./rules-service');

let games = [];

const clearRound = (game) => {
    var playedCards = [];

    js.iterate(game.playerSet.players, (player) => {
        playedCards = playedCards.concat(playerService.clearRound(player));
    });
    cardSetService.addPlayedCards(game.cardSet, playedCards);
    
    if (game.cardSet.playedCards.length > 80) {
        cardSetService.refill(game.cardSet);
    }
};

const create = (ownerId, cardSet, playerSet) => {
    cardSet = cardSet || cardSetService.create();        
    playerSet = playerSet || playerSetService.create(ownerId);

    var game = new Game(cardSet, playerSet);
    games.push(game);

    return games.length - 1;
};

const endRound = (game) => {
    if (playerSetService.getCurrentPlayer(game.playerSet).id !== playerSetService.getDealer(game.playerSet).id) {
        throw 'Can\'t play dealer round yet!';
    }
    
    var dealerScore = rulesService.dealerTurn(game, () => cardSetService.getNextCard(game.cardSet));

    js.iterate(game.playerSet.players, (player, key) => {            
        if (player !== playerSetService.getDealer(game.playerSet)) {
            rulesService.resolve(player, dealerScore);
        }
    });

    playerSetService.endRound(game.playerSet);
};

const getCurrentPlayer = (game) => {
    return playerSetService.getCurrentPlayer(game.playerSet);
};

const getGame = (gameId) => {
    return games[gameId];
};

const joinGame = (gameId, playerId) => {
    var game = games[gameId];
    if (!game) {
        throw 'No game identified by ' + gameId + ' was found';
    }

    playerSetService.addPlayer(game.playerSet, playerId);

    return game;
};

const makeDecision = (game, playerId, action) => {
    var player = playerSetService.ensurePlayer(game.playerSet, playerId);
    switch (action) {
        case 'Double': {
            rulesService.double(game, player, () => cardSetService.getNextCard(game.cardSet));
            break;
        }
        case 'Hit': {
            rulesService.hit(game, player, () => cardSetService.getNextCard(game.cardSet));
            break;
        }
        case 'Split': {
            rulesService.split(game, player, () => cardSetService.getNextCard(game.cardSet));
            break;
        }
        case 'Stand': {
            rulesService.stand(game, player, () => cardSetService.getNextCard(game.cardSet));
            break;
        }
    }
};

const startRound = (game) => {
    rulesService.startRound(game, () => cardSetService.getNextCard(game.cardSet));
    playerSetService.startRound(game.playerSet);
};

module.exports = {
    clearRound,
    create,
    endRound,
    getCurrentPlayer,
    getGame,
    joinGame,
    makeDecision,
    startRound
};
