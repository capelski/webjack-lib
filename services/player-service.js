'use strict';

const Player = require('../models/player');
const handService = require('./hand-service');
const js = require('../utils/js-generics');

const create = (id, name) => new Player(id, name);

const collectPlayedCards = (player) => {
    var cards = player.hands.reduce((cards, hand) => cards.concat(handService.getCards(hand)), []);
    player.hands = [];
    return cards;
};

const dealCard = (player, card) => {
    var currentHand = getCurrentHand(player);
    var handScore = handService.addCard(currentHand, card);
    return handScore;
};

const doubleCurrentHand = (player) => {
    var currentHand = getCurrentHand(player);
    currentHand.value += 1;
};

const getCurrentHand = (player) => player.hands.find(h => !h.played);

const hasUnplayedHand = (player) =>
    player.hands.reduce((unplayedHand, hand) => unplayedHand || !hand.played, false);

const initializeHand = (player) => {
    var hand = handService.create();
    player.hands = [hand];
};

const resolveHands = (player, dealerScore) => {
    var earningRate = player.hands.reduce((rate, hand) => rate + handService.resolve(hand, dealerScore), 0);
    player.earningRate += earningRate;
};

const splitCurrentHand = (player) => {
    var currentHand = getCurrentHand(player);
    var firstCard = currentHand.cards.splice(-1)[0];

    var newHand = handService.create();
    handService.addCard(newHand, firstCard);

    var index = player.hands.findIndex(h => h == currentHand);
    player.hands.splice(index + 1, 0, newHand);
};

module.exports = {
    collectPlayedCards,
    create,
    dealCard,
    doubleCurrentHand,
    getCurrentHand,
    hasUnplayedHand,
    initializeHand,
    resolveHands,
    splitCurrentHand
};
