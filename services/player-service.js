'use strict';

const Player = require('../models/player');
const handSetService = require('./hand-set-service');

const create = (id, name) => {
    return new Player(id, name);
};

const getCurrentHand = (player) => {
    return handSetService.getCurrentHand(player.handSet);
};

const startRound = (player) => {
    var handSet = handSetService.create();
    player.handSet = handSet;
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
