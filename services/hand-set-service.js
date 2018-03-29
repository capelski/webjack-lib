'use strict';

const js = require('../utils/js-generics');
const HandSet = require('../models/hand-set');
const handService = require('./hand-service');

const dealCard = (handSet, card) => {
    var currentHand = getCurrentHand(handSet);
    var handScore = handService.addCard(currentHand, card);
    return handScore;
};

const collectPlayedCards = (handSet) => {
    var cards = [];
    js.iterate(handSet.hands, (hand) => {
        cards = cards.concat(handService.getCards(hand));
    });
    return cards;
};

const create = () => {
    var handSet = new HandSet();
    var hand = handService.create();
    handSet.hands.push(hand);
    handSet.currentHand = 0;
    return handSet;
}

const doubleCurrentHand = (handSet) => {
    var currentHand = getCurrentHand(handSet);
    currentHand.value += 1;
};

const getNextHand = (handSet) => {
    handSet.currentHand++;
    return handSet.hands[handSet.currentHand];
};

const getCurrentHand = (handSet) => {
    if (!handSet.hands || !handSet.hands[handSet.currentHand]) {
        throw 'No available hands in the hand set!';
    }
    return handSet.hands[handSet.currentHand];
};

const hasUnplayedHand = (handSet) => {
    var pendingHand = false;
    handSet.hands.forEach((hand) => {
        pendingHand = pendingHand || (hand.status === 'Unplayed');
    });
    return pendingHand;
};

const splitCurrentHand = (handSet) => {
    var currentHand = getCurrentHand(handSet);
    var firstCard = currentHand.cards.splice(-1)[0];

    var newHand = handService.create();
    handService.addCard(newHand, firstCard);

    handSet.hands.splice(handSet.currentHand + 1, 0, newHand);
};

const updateEarningRate = (handSet) => {
    handSet.earningRate = 0;
    handSet.hands.forEach((hand) => {
        var handReturningRate = 
        1.5 * (hand.status === 'BlackJack') +
        1 * (hand.status === 'Wins') +
        0 * (hand.status === 'Ties') +
        -1 * (hand.status === 'Loses');
        handSet.earningRate += handReturningRate * hand.value;
    });
    return handSet.earningRate;
};

module.exports = {
    dealCard,
    collectPlayedCards,
    create,
    doubleCurrentHand,
    getCurrentHand,
    getNextHand,
    hasUnplayedHand,
    splitCurrentHand,
    updateEarningRate
};
