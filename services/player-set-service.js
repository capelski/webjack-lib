'use strict';

const js = require('../utils/js-generics');
const PlayerSet = require('../models/player-set');
const playerService = require('./player-service');

const addPlayer = (playerSet, playerId) => {
    // TODO Check max capacity
    // TODO Check the game status and add only when no round
    var player = playerService.create(playerId);
    // TODO push after removing the dealer
    playerSet.players.unshift(player);
};

const collectPlayedCards = (playerSet) => {
    var playedCards = playerSet.players.reduce((cards, player) => cards.concat(playerService.clearRound(player)), []);
    return playedCards;
};

const create = (ownerId) => {
    var dealer = playerService.create(0, 'Dealer');
    var owner = playerService.create(ownerId, 'XXXX');
    
    var playerSet = new PlayerSet(dealer, [owner]);

    return playerSet;
};

// TODO Remove
const endRound = (playerSet) => {
    playerSet.currentIndex = null;
};

// TODO Move to game-service
const ensurePlayer = (playerSet, playerId) => {
    if (playerSet.currentIndex == null) {
        throw 'No round has been started yet!';
    }
    var currentPlayer = playerSet.players[playerSet.currentIndex];
    if (!currentPlayer) {
        throw 'There is no player identified by ' + playerId;
    }
    else if (currentPlayer.id !== playerId) {
        var ensuredPlayer = getPlayerById(playerSet, playerId);
        throw ensuredPlayer.name + ' can\'t play now! It is ' + currentPlayer.name + '\'s turn';
    }
    else if (currentPlayer.id === getDealer(playerSet).id) {
        throw 'Can\'t play dealer\'s turn!';
    }
    else {
        try {
            playerService.getCurrentHand(currentPlayer);
            return currentPlayer;
        }
        catch (error) {
            startNextTurn(playerSet);
            throw 'Player ' + currentPlayer.name + ' can\'t play anymore this round!';
        }            
    }        
};

// TODO Adapt to recieve also a playerId. Rename to getPlayerById
const getCurrentPlayer = (playerSet) => {
    return playerSet.players[playerSet.currentIndex];
};

const getDealer = (playerSet) => {
    return playerSet.players[playerSet.players.length - 1];
};

const getPlayerById = (playerSet, playerId) => {
    var player = null;
    var index = 0;
    while (!player && index < playerSet.players.length) {
        if (playerSet.players[index].id === playerId) {
            player = playerSet.players[index];
        }
        ++index;
    }
    return player;
};

const isDealerTurn = (playerSet) => getCurrentPlayer(playerSet).id === getDealer(playerSet).id;

// TODO Move to game-service
const startNextTurn = (playerSet) => {
    var nextPlayer = null;
    while (!nextPlayer && (playerSet.currentIndex < playerSet.players.length - 1)) {            
        nextPlayer = playerSet.players[playerSet.currentIndex];
        if (!playerService.hasUnplayedHand(nextPlayer)) {
            nextPlayer = null;
            playerSet.currentIndex++;
        }            
    }
    return nextPlayer;
};

// TODO Remove
const startRound = (playerSet) => {
    playerSet.currentIndex = 0;
    startNextTurn(playerSet);
};

module.exports = {
    addPlayer,
    collectPlayedCards,
    create,
    endRound,
    ensurePlayer,
    getDealer,
    getPlayerById,
    isDealerTurn,
    startNextTurn,
    startRound
};
