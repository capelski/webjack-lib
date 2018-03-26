'use strict';

const Card = require('../models/card');
const cardsValue = {
    'A': 11,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 10,
    'Q': 10,
    'K': 10
};

const create = (suit, number) => new Card(suit, number);

const getValue = (card) => cardsValue[card.number];

const isAce = (card) => card.number === 'A';

module.exports = {
    create,
    getValue,
    isAce
};
