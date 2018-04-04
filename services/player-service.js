'use strict';

const Player = require('../models/player');
const handService = require('./hand-service');
const js = require('../utils/js-generics');

const create = (id, name) => new Player(id, name);

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

// TODO Order alpha

const dealCard = (player, card) => {
    var currentHand = getCurrentHand(player);
    var handScore = handService.addCard(currentHand, card);
    return handScore;
};

const collectPlayedCards = (player) => {
    // TODO Remove the cards from the hands
    var cards = [];
    js.iterate(player.hands, (hand) => {
        cards = cards.concat(handService.getCards(hand));
    });
    return cards;
};

const doubleCurrentHand = (player) => {
    var currentHand = getCurrentHand(player);
    currentHand.value += 1;
};

const getCurrentHand = (player) => player.hands.find(h => !h.played);

const splitCurrentHand = (player) => {
    var currentHand = getCurrentHand(player);
    var firstCard = currentHand.cards.splice(-1)[0];

    var newHand = handService.create();
    handService.addCard(newHand, firstCard);

    // TODO currentHand doesn't exist anymore. Get the index of the hand. TEST
    var index = player.hands.findIndex(h => h == currentHand);
    player.hands.splice(index + 1, 0, newHand);
};

module.exports = {
    dealCard,
    collectPlayedCards,
    doubleCurrentHand,
    getCurrentHand,
    splitCurrentHand,
    create,
    hasUnplayedHand,
    initializeHand,
    resolveHands
};
