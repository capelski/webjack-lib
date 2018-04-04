'use strict';

const Player = require('../models/player');
const handService = require('./hand-service');
const handSetService = require('./hand-set-service');

const create = (id, name) => new Player(id, name);

const hasUnplayedHand = (player) => 
    player.handSet != null &&
    player.handSet.hands.reduce((unplayedHand, hand) => unplayedHand || !hand.played, false);

const initializeHand = (player) => {
    var handSet = handSetService.create();
    player.handSet = handSet;
};

const resolveHands = (player, dealerScore) => {
    var earningRate = player.handSet.hands.reduce((rate, hand) => rate + handService.resolve(hand, dealerScore), 0);
    player.earningRate += earningRate;
};

module.exports = {
    create,
    hasUnplayedHand,
    initializeHand,
    resolveHands
};
