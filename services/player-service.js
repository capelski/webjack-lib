'use strict';

const Player = require('../models/player');
const handService = require('./hand-service');
const handSetService = require('./hand-set-service');

const create = (id, name) => new Player(id, name);

const resolveHands = (player, dealerScore) => {
    player.handSet.hands.forEach(hand => handService.resolve(hand, dealerScore));
    // TODO Move following to handService?
    var earningRate = handSetService.updateEarningRate(player.handSet);
    player.earningRate += earningRate;
};

const initializeHand = (player) => {
    var handSet = handSetService.create();
    player.handSet = handSet;
};

module.exports = {
    create,
    resolveHands,
    initializeHand
};
