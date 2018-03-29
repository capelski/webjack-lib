'use strict';

const handService = require('./hand-service');
const handSetService = require('./hand-set-service');

const double = (player, card) => {
    handSetService.doubleCurrentHand(player.handSet);
    var handScore = handSetService.dealCard(player.handSet, card);
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isOverMaxScore = handService.isOverMaxScore(playerHand);
    if (!isOverMaxScore) {
        handService.setStatus(playerHand, 'Played');
    }
};

const hit = (player, card) => {
    var handScore = handSetService.dealCard(player.handSet, card);
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isOverMaxScore = handService.isOverMaxScore(playerHand);
    return isOverMaxScore;
};

const split = (player, card) => {
    handSetService.splitCurrentHand(player.handSet);
    var handScore = handSetService.dealCard(player.handSet, card);
    var playerHand = handSetService.getCurrentHand(player.handSet);
    var isBlackJack = handService.isBlackJack(playerHand);
    return isBlackJack;
};

const stand = (player) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    handService.setStatus(playerHand, 'Played');
};

module.exports = {
    double,
    hit,
    split,
    stand
};
