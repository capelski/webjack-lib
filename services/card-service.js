'use strict';

let Card = require('../models/card');
let cardsValue = {
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

function cardService() {

    function create(suit, number) {
        return new Card(suit, number);
    }

    function getValue(card) {
        return cardsValue[card.number];
    }

    function isAce(card) {
        return card.number === 'A';
    }

    return {
        create,
        getValue,
        isAce
    };
}

module.exports = cardService();
