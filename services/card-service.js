'use strict';

let nodeUtils = require('../utils/node');
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

    function stringify(card) {
        return card.number + card.suit;
    }

    return {
        create: nodeUtils.trace(cardService.name, create, true),
        getValue: nodeUtils.trace(cardService.name, getValue, true),
        isAce: nodeUtils.trace(cardService.name, isAce, true),
        stringify: nodeUtils.trace(cardService.name, stringify, true)
    };
}

module.exports = cardService();
