'use strict';

const Hand = require('../models/hand');
const cardService = require('./card-service');
const scoreService = require('./score-service');
const js = require('../utils/js-generics');

const addCard = (hand, card) => {
    hand.hasAce = hand.hasAce || cardService.isAce(card);
    hand.cards.push(card);
    hand.score = scoreService.getHandScore(hand);
}

const clear = (hand) => {
    var cards = hand.cards;
    hand.cards = [];
    hand.hasAce = false;
    hand.status = null;
    return cards;
}

const create = () => {
    return new Hand();
}

const getScore = (hand) => {
    return scoreService.getHandScore(hand).effective;
}

const isSplitable = (hand) => {
    return (hand.cards.length === 2 &&
    cardService.getValue(hand.cards[0]) === cardService.getValue(hand.cards[1]));
}

const setStatus = (hand, status) => {
    hand.status = status;
}

module.exports = {
    addCard,
    clear,
    create,
    getScore,
    isSplitable,
    setStatus
};
