'use strict';

const js = require('../utils/js-generics');
const Game = require('../models/game');
const cardSetService = require('./card-set-service');
const playerSetService = require('./player-set-service');
const rulesService = require('./rules-service');
const handSetService = require('./hand-set-service');
const playerService = require('./player-service');
const handService = require('./hand-service');

// TODO Rename to table-service
// Extract logic into orchestration-service

let games = [];

const collectPlayedCards = (game) => {
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
    
    var dealer = playerSetService.getDealer(game.playerSet);
    var dealerHand = handSetService.getCurrentHand(dealer.handSet);
    var dealerScore = handService.getScore(dealerHand); // TODO Use score property
    while (dealerScore < 17) {
        dealerScore = handSetService.dealCard(dealer.handSet, cardSetService.getNextCard(game.cardSet));
    }

    js.iterate(game.playerSet.players, (player, key) => {            
        if (player !== playerSetService.getDealer(game.playerSet)) {
            playerService.resolveHands(player, dealerScore);
        }
    });

    playerSetService.endRound(game.playerSet);
};

const ensurePlayer = (playerSet, playerId) => {
    if (playerSet.currentIndex == null) {
        throw 'No round has been started yet!';
    }
    var currentPlayer = playerSet.players[playerSet.currentIndex];
    if (!currentPlayer) {
        throw 'There is no player identified by ' + playerId;
    }
    else if (currentPlayer.id !== playerId) {
        var ensuredPlayer = playerSetService.getPlayerById(playerSet, playerId);
        throw ensuredPlayer.name + ' can\'t play now! It is ' + currentPlayer.name + '\'s turn';
    }
    else if (currentPlayer.id === playerSetService.getDealer(playerSet).id) {
        throw 'Can\'t play dealer\'s turn!';
    }
    else {
        try {
            handSetService.getCurrentHand(currentPlayer.handSet);
            return currentPlayer;
        }
        catch (error) {
            playerSetService.startNextTurn(playerSet);
            throw 'Player ' + currentPlayer.name + ' can\'t play anymore this round!';
        }            
    }        
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
    var player = ensurePlayer(game.playerSet, playerId);
    switch (action) {
        case 'Double': {
            var playerHand = handSetService.getCurrentHand(player.handSet);
            if (!handService.canDouble(playerHand)) {
                throw 'Doubling is only allowed with 9, 10 or 11 points';
            }
            rulesService.double(player, cardSetService.getNextCard(game.cardSet));
            startNextHand(game, player);
            break;
        }
        case 'Hit': {
            var isBurned = rulesService.hit(player, cardSetService.getNextCard(game.cardSet));
            if (isBurned) {
                startNextHand(game, player);
            }
            break;
        }
        case 'Split': {
            var playerHand = handSetService.getCurrentHand(player.handSet);
            if (!handService.canSplit(playerHand)) {
                throw 'Splitting is only allowed with two equal cards!';
            }
            var isBlackJack = rulesService.split(player, cardSetService.getNextCard(game.cardSet));
            if (isBlackJack) {
                startNextHand(game, player);
            }
            break;
        }
        case 'Stand': {
            rulesService.stand(player);
            startNextHand(game, player);
            break;
        }
    }
};

const startNextHand = (game, player) => {
    var nextHand = handSetService.getNextHand(player.handSet);
    if (nextHand) {
        var handScore = handSetService.dealCard(player.handSet, cardSetService.getNextCard(game.cardSet));
        var playerHand = handSetService.getCurrentHand(player.handSet);
        var isBlackJack = handService.isBlackJack(playerHand);
        if (isBlackJack) {
            startNextHand(game, player);
        }
    }
    else {
        playerSetService.startNextTurn(game.playerSet);
    }
};

const startRound = (game) => {
    // TODO Exclude dealer from players

    game.playerSet.players.forEach(player => {
        playerService.startRound(player);
        handSetService.dealCard(player.handSet, cardSetService.getNextCard(game.cardSet));
    });

    game.playerSet.players.forEach(player => {
        if (player !== playerSetService.getDealer(game.playerSet)) {
            var handScore = handSetService.dealCard(player.handSet, cardSetService.getNextCard(game.cardSet));
            var playerHand = handSetService.getCurrentHand(player.handSet);
            handService.isBlackJack(playerHand);
        }
    });

    playerSetService.startRound(game.playerSet);
};

module.exports = {
    collectPlayedCards,
    create,
    endRound,
    getGame,
    joinGame,
    makeDecision,
    startRound
};
