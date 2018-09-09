'use strict';

const Hand = require('../models/hand');
const cardService = require('./card-service');
const js = require('../utils/js-generics');

const getCards = (hand) => hand.cards;

const canDouble = (hand) => hand.score > 8 && hand.score < 12;

const canSplit = (hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const create = (bet) => new Hand(bet);

const getScore = (hand) => {
    var cardReducer = (result, card) => 
        js.cartesianProduct(result, cardService.getValue(card), (x, y) => x + y);
    var allScores = hand.cards.reduce(cardReducer, [0]);
    var score = allScores.reduce((bestScore, nextScore) => (bestScore == 0 || nextScore < 22) ? nextScore : bestScore, 0);
    return score;
};

const isBlackJack = (hand) => {
    var _isBlackJack = hand.score === 21 && hand.cards.length === 2;
    if (_isBlackJack) {
        hand.status = 'BlackJack';
    }
    return _isBlackJack;
};

const isOverMaxScore = (hand) => {
    var _isOverMaxScore = hand.score > 21;
    if (_isOverMaxScore) {
        hand.status = 'Loses';
    }
    return _isOverMaxScore;
};

const markAsPlayed = (hand) => {
    hand.played = true;
};

const addCard = (hand, card) => {
    hand.cards.push(card);
    hand.score = getScore(hand);
    hand.canDouble = canDouble(hand);
    hand.canSplit = canSplit(hand);
    const isHandAlive = !isBlackJack(hand) && !isOverMaxScore(hand);
    if (!isHandAlive) {
        markAsPlayed(hand);
    }

    return {
        score: hand.score,
        isHandAlive
    };
};

const resolve = (hand, dealerScore) => {
    if (hand.score > 21) {
        hand.status = 'Loses';
    }
    else if (hand.score === 21 && hand.cards.length === 2) {
        hand.status = 'BlackJack';
    }
    else if (dealerScore > 21) {
        hand.status = 'Wins';
    }
    else if (hand.score === dealerScore) {
        hand.status = 'Ties';
    }
    else {
        hand.status = hand.score > dealerScore ? 'Wins' : 'Loses';
    }

    return hand.value * (
        2.5 * (hand.status === 'BlackJack') +
        2 * (hand.status === 'Wins') +
        1 * (hand.status === 'Ties') +
        0 * (hand.status === 'Loses'));
};

module.exports = {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    getScore,
    markAsPlayed,
    resolve
};
