'use strict';

const Hand = require('../models/hand');
const HandScore = require('../models/hand-score');
const cardService = require('./card-service');
const js = require('../utils/js-generics');

const clear = (hand) => {
    var cards = hand.cards;
    hand.cards = [];
    hand.hasAce = false;
    hand.status = null;
    return cards;
};

const create = () => {
    return new Hand();
};

const addCardScore = (handScore, card) => {    
    if (cardService.isAce(card)) {
        handScore.min += 1;
        handScore.max += (handScore.max + 11 > 21 ? 1 : 11);
    }
    else {
        const value = cardService.getValue(card);
        handScore.min += value;
        handScore.max += value;
    }
};

const getScore = (hand) => {
    var handScore = new HandScore();
    var sortedHand = js.clone(hand.cards)
    .sort((a, b) => {
        return cardService.getValue(a) > cardService.getValue(b);
    });

    js.iterate(sortedHand, (card) => {
        addCardScore(handScore, card);
    });

    if (handScore.max > 21 || handScore.min === handScore.max) {
        handScore.effective = handScore.min;
    }
    else {
        handScore.effective = handScore.max;
    }

    return handScore.effective;
};

const addCard = (hand, card) => {
    hand.hasAce = hand.hasAce || cardService.isAce(card);
    hand.cards.push(card);
    hand.score = getScore(hand);
};

const isSplitable = (hand) => {
    return (hand.cards.length === 2 &&
    cardService.getValue(hand.cards[0]) === cardService.getValue(hand.cards[1]));
};

const setStatus = (hand, status) => {
    hand.status = status;
};

module.exports = {
    addCard,
    clear,
    create,
    getScore,
    isSplitable,
    setStatus
};
