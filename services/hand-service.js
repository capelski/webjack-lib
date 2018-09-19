'use strict';

const Hand = require('../models/hand');
const cardService = require('./card-service');
const js = require('../utils/js-generics');

const getCards = (hand) => hand.cards;

const canDouble = (hand) => getScore(hand) > 8 && getScore(hand) < 12;

const canSplit = (hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const create = (bet) => new Hand(bet);

const getScore = (hand) => hand.scores[hand.scores.length - 1];

const setScore = (hand) => {
    const handReducer = (result, card) => {
        const values = js.cartesianProduct(result, cardService.getValue(card), (x, y) => x + y);
        const uniqueValuesDictionary = values.reduce((uniques, next) => ({...uniques, [next]: next}), {});
        const uniqueValuesArray = Object.keys(uniqueValuesDictionary).map(x => parseInt(x));
        let filteredValuesArray = uniqueValuesArray;

        if (uniqueValuesDictionary['21']) {
            filteredValuesArray = [21];
        }

        if (uniqueValuesArray.length > 1) {
           filteredValuesArray = filteredValuesArray.filter(x => x < 22);
        }

        return filteredValuesArray;
    };
    hand.scores = hand.cards.reduce(handReducer, [0]);
};

const isBlackJack = (hand, isDealer) => {
    const _isBlackJack = getScore(hand) === 21 && hand.cards.length === 2;
    if (_isBlackJack && !isDealer) {
        hand.status = 'BlackJack!';
    }
    return _isBlackJack;
};

const isMaxScore = (hand) => getScore(hand) === 21;

const isOverMaxScore = (hand, isDealer) => {
    const _isOverMaxScore = getScore(hand) > 21;
    if (_isOverMaxScore && !isDealer) {
        hand.status = 'Dealer wins';
    }
    return _isOverMaxScore;
};

const markAsPlayed = (hand) => {
    hand.played = true;
};

const addCard = (hand, card, isDealer) => {
    hand.cards.push(card);
    setScore(hand);
    hand.canDouble = canDouble(hand);
    hand.canSplit = canSplit(hand);
    const isHandAlive = !isBlackJack(hand, isDealer) && !isOverMaxScore(hand, isDealer) && !isMaxScore(hand);
    // TODO This logic shouldn't be here but in the orchestration service
    if (!isHandAlive) {
        markAsPlayed(hand);
    }

    return {
        score: getScore(hand),
        isHandAlive
    };
};

const resolve = (hand, dealerScore) => {
    const score = getScore(hand);
    if (score > 21) {
        hand.status = 'Dealer wins';
    }
    else if (score === 21 && hand.cards.length === 2) {
        hand.status = 'BlackJack!';
    }
    else if (dealerScore > 21) {
        hand.status = 'Player wins';
    }
    else if (score === dealerScore) {
        hand.status = 'Push';
    }
    else {
        hand.status = score > dealerScore ? 'Player wins' : 'Dealer wins';
    }

    return hand.value * (
        2.5 * (hand.status === 'BlackJack!') +
        2 * (hand.status === 'Player wins') +
        1 * (hand.status === 'Push') +
        0 * (hand.status === 'Dealer wins'));
};

module.exports = {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    markAsPlayed,
    resolve
};
