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
    // TODO Remove the cards from the hands
    var cards = [];
    js.iterate(handSet.hands, (hand) => {
        cards = cards.concat(handService.getCards(hand));
    });
    return cards;
};

const create = () => {
    var hand = handService.create();
    var handSet = new HandSet([hand]);
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

const splitCurrentHand = (handSet) => {
    var currentHand = getCurrentHand(handSet);
    var firstCard = currentHand.cards.splice(-1)[0];

    var newHand = handService.create();
    handService.addCard(newHand, firstCard);

    handSet.hands.splice(handSet.currentHand + 1, 0, newHand);
};

module.exports = {
    dealCard,
    collectPlayedCards,
    create,
    doubleCurrentHand,
    getCurrentHand,
    getNextHand,
    splitCurrentHand
};
