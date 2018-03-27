'use strict';

const Player = require('../models/player');
const handSetService = require('./hand-set-service');

const clearRound = (player) => {
    return handSetService.clearRound(player.handSet);
};

const create = (id, name) => {
    var handSet = handSetService.create();
    return new Player(id, name, handSet);
};

const dealCard = (player, card) => {
    handSetService.addCard(player.handSet, card);
};

const getCurrentHand = (player) => {
    return handSetService.getCurrentHand(player.handSet);
};

const hasUnplayedHand = (player) => {
    return handSetService.hasUnplayedHand(player.handSet);
};

const startRound = (player) => {
    return handSetService.startRound(player.handSet);
};

const updateEarningRate = (player) => {
    var earningRate = handSetService.updateEarningRate(player.handSet);
    player.earningRate += earningRate;
};

module.exports = {
    clearRound,
    create,
    dealCard,
    getCurrentHand,
    hasUnplayedHand,
    startRound,
    updateEarningRate
};
