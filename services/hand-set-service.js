'use strict';

const js = require('../utils/js-generics');
const HandSet = require('../models/hand-set');
const handService = require('./hand-service');

const addAction = (handSet, action) => {
    handSet.actions.push(action);
};

const addCard = (handSet, card) => {
    var currentHand = getCurrentHand(handSet);
    handService.addCard(currentHand, card);
};

const clearRound = (handSet) => {
    var cards = [];
    js.iterate(handSet.hands, (hand) => {
        cards = cards.concat(handService.clear(hand));
    });

    handSet.actions = [];        
    handSet.currentHand = null;        
    handSet.hands = [];
    handSet.earningRate = null;

    return cards;
};

const create = () => {
    return new HandSet();
};

const doubleCurrentHand = (handSet) => {
    var currentHand = getCurrentHand(handSet);
    currentHand.worth += 1;
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

const startRound = (handSet) => {
    handSet.actions = [];
    handSet.currentHand = 0;
    handSet.hands.push(handService.create());
};

const splitCurrentHand = (handSet) => {
    var currentHand = getCurrentHand(handSet);
    var newHand = handService.create();
    handSet.hands.splice(handSet.currentHand + 1, 0, newHand);
    newHand.cards = currentHand.cards.splice(-1);
};

const updateEarningRate = (handSet) => {
    handSet.earningRate = 0;
    handSet.hands.forEach((hand) => {
        var handReturningRate = 
        1.5 * (hand.status === 'BlackJack') +
        1 * (hand.status === 'Wins') +
        0 * (hand.status === 'Ties') +
        -1 * (hand.status === 'Loses');
        handSet.earningRate += handReturningRate * hand.worth;
    });
    return handSet.earningRate;
};

module.exports = {
    addAction,
    addCard,
    clearRound,
    create,
    doubleCurrentHand,
    getCurrentHand,
    getNextHand,
    hasUnplayedHand,
    splitCurrentHand,
    startRound,
    updateEarningRate
};
