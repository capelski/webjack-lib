'use strict';

const handService = require('./hand-service');
const handSetService = require('./hand-set-service');
const playerService = require('./player-service');
const playerSetService = require('./player-set-service');

// TODO Move all but resolve to handSetService
// TODO Move resolve to game-service
// TODO Remove rules-service

const canDouble = (player) => {
    var playerHand = handSetService.getCurrentHand(player.handSet);
    return playerHand.score > 8 && playerHand.score < 12;
};

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

const resolve = (player, dealerScore) => {
    player.handSet.hands.forEach((hand) => {
        var status;

        if (hand.score > 21) {
            status = 'Loses';
        }
        else if (hand.score === 21 && hand.cards.length === 2) {
            status = 'BlackJack';
        }
        else if (dealerScore > 21) {
            status = 'Wins';
        }
        else if (hand.score === dealerScore) {
            status = 'Ties';
        }
        else {
            status = hand.score > dealerScore ? 'Wins' : 'Loses';
        }
        handService.setStatus(hand, status);
    });
    playerService.updateEarningRate(player);        
};

const canSplit = (player) => {
    var currentHand = handSetService.getCurrentHand(player.handSet);
    return handService.isSplitable(currentHand);
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
    canDouble,
    canSplit,
    double,
    hit,
    resolve,
    split,
    stand
};
