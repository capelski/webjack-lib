'use strict';

const js = require('../utils/js-generics');
const PlayerSet = require('../models/player-set');
const playerService = require('./player-service');
const handSetService = require('./hand-set-service');
const uuidV4 = require('uuid/v4');

// TODO Add queuedPlayers

const addPlayer = (playerSet, playerId) => {
    // TODO Check max capacity
    // TODO Check the table status and add only when no round
    var player = playerService.create(playerId);
    // TODO push after removing the dealer from players array
    playerSet.players.unshift(player);
};

const collectPlayedCards = (playerSet) => {
    var playedCards = playerSet.players.reduce((cards, player) => cards.concat(handSetService.collectPlayedCards(player.handSet)), []);
    playerSet.players.forEach(player => player.handSet = null);
    return playedCards;
};

const create = () => {
    var dealer = playerService.create(uuidV4(), 'Dealer');    
    var playerSet = new PlayerSet(dealer);

    return playerSet;
};

// TODO Remove
const endRound = (playerSet) => {
    playerSet.currentIndex = null;
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

module.exports = {
    addPlayer,
    collectPlayedCards,
    create,
    endRound,
    getDealer,
    getPlayerById,
    isDealerTurn
};
