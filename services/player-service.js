'use strict';

const Player = require('../models/player');
const handSetService = require('./hand-set-service');

const create = (id, name) => {
    var handSet = handSetService.create();
    return new Player(id, name, handSet);
};

const getCurrentHand = (player) => {
    return handSetService.getCurrentHand(player.handSet);
};

const startRound = (player) => {
    return handSetService.startRound(player.handSet);
};

const updateEarningRate = (player) => {
    var earningRate = handSetService.updateEarningRate(player.handSet);
    player.earningRate += earningRate;
};

module.exports = {
    create,
    getCurrentHand,
    startRound,
    updateEarningRate
};
