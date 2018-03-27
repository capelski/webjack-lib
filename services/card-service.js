'use strict';

const Card = require('../models/card');
const js = require('../utils/js-generics');

const cardsValue = {
    'A': [1, 11],
    '2': [2],
    '3': [3],
    '4': [4],
    '5': [5],
    '6': [6],
    '7': [7],
    '8': [8],
    '9': [9],
    '10': [10],
    'J': [10],
    'Q': [10],
    'K': [10]
};
const symbols = Object.keys(cardsValue);
const suits = ['\u2663', '\u2666', '\u2665', '\u2660'];

const createDeck = () => {
    return js.cartesianProduct(suits, symbols, (suit, symbol) => {
        return new Card(suit, symbol);
    });
};

const getValue = (card) => cardsValue[card.symbol];

module.exports = {
    createDeck,
    getValue
};
