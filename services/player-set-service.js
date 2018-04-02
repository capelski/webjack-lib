'use strict';

const js = require('../utils/js-generics');
const PlayerSet = require('../models/player-set');
const playerService = require('./player-service');
const handSetService = require('./hand-set-service');
const uuidV4 = require('uuid/v4');

const addPlayer = (playerSet, playerId) => {
    var player = playerService.create(playerId);
    playerSet.players.push(player);
};

const collectPlayedCards = (playerSet) => {
    var playedCards = playerSet.players.filter(p => p.handSet != null)
        .reduce((cards, player) => cards.concat(handSetService.collectPlayedCards(player.handSet)), []);
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

const getActivePlayer = (playerSet) => playerSet.players.find(p => p.id === playerSet.activePlayerId);

module.exports = {
    addPlayer,
    collectPlayedCards,
    create,
    getActivePlayer
};
