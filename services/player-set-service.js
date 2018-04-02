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
    playedCards = playedCards.concat(handSetService.collectPlayedCards(playerSet.dealer.handSet));

    playerSet.players.forEach(player => player.handSet = null);
    playerSet.dealer.handSet = null;
    
    return playedCards;
};

const create = () => {
    var dealer = playerService.create(uuidV4(), 'Dealer');    
    var playerSet = new PlayerSet(dealer);

    return playerSet;
};

const getActivePlayer = (playerSet) =>
{
    var activePlayer = playerSet.players.find(p => p.id === playerSet.activePlayerId);
    if (!activePlayer && playerSet.activePlayerId == playerSet.dealer.id) {
        activePlayer = playerSet.dealer;
    }

    return activePlayer
};

const getDealer = (playerSet) => {
    return playerSet.dealer;
};

const getPlayerById = (playerSet, playerId) => {
    var player = playerSet.players.find(p => p.id === playerId);
    if (!player && playerId == playerSet.dealer.id) {
        player = playerSet.dealer;
    }
    return player;
};

const isDealerTurn = (playerSet) => getActivePlayer(playerSet).id === getDealer(playerSet).id;

const updateActivePlayer = (playerSet) => {
    if (playerSet.activePlayerId == null) {
        playerSet.activePlayerId = playerSet.players[0].id;
    }
    else {
        // TODO Refactor turn code...
        var nextPlayer = null;
        var index = 0;
        while (!nextPlayer && (index < playerSet.players.length)) {
            if (handSetService.hasUnplayedHand(playerSet.players[index].handSet)) {
                nextPlayer = playerSet.players[index];
                playerSet.activePlayerId = nextPlayer.id;
            }
            ++index;
        }
        if (!nextPlayer && handSetService.hasUnplayedHand(playerSet.dealer.handSet)) {
            nextPlayer = playerSet.dealer;
            playerSet.activePlayerId = nextPlayer.id;
        }
    }
};

module.exports = {
    addPlayer,
    collectPlayedCards,
    create,
    getActivePlayer,
    getDealer,
    getPlayerById,
    isDealerTurn,
    updateActivePlayer
};
