'use strict';

const js = require('../utils/js-generics');
const Game = require('../models/game');
const cardSetService = require('./card-set-service');
const playerSetService = require('./player-set-service');
const rulesService = require('./rules-service');
const handSetService = require('./hand-set-service');
const playerService = require('./player-service');

let games = [];

const clearRound = (game) => {
    var playedCards = playerSetService.collectPlayedCards(game.playerSet);
    cardSetService.addPlayedCards(game.cardSet, playedCards);
};

const create = (ownerId, cardSet, playerSet) => {
    cardSet = cardSet || cardSetService.create();        
    playerSet = playerSet || playerSetService.create(ownerId);

    var game = new Game(cardSet, playerSet);
    games.push(game);

    return games.length - 1;
};

const endRound = (game) => {
    if (!playerSetService.isDealerTurn(game.playerSet)) {
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
            startNextHand(game, player);
            break;
        }
        case 'Hit': {
            var isBurned = rulesService.hit(game, player, () => cardSetService.getNextCard(game.cardSet));
            if (isBurned) {
                startNextHand(game, player);
            }
            break;
        }
        case 'Split': {
            var isBlackJack = rulesService.split(game, player, () => cardSetService.getNextCard(game.cardSet));
            if (isBlackJack) {
                startNextHand(game, player);
            }
            break;
        }
        case 'Stand': {
            rulesService.stand(game, player, () => cardSetService.getNextCard(game.cardSet));
            startNextHand(game, player);
            break;
        }
    }
};

const startNextHand = (game, player) => {
    var nextHand = handSetService.getNextHand(player.handSet);
    if (nextHand) {
        var handScore = playerService.dealCard(player, cardSetService.getNextCard(game.cardSet));
        var playerHand = playerService.getCurrentHand(player);
        var isBlackJack = rulesService.checkBlackJack(playerHand);
        if (isBlackJack) {
            startNextHand(game, player);
        }
    }
    else {
        playerSetService.startNextTurn(game.playerSet);
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
    getGame,
    joinGame,
    makeDecision,
    startRound
};
