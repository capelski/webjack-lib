'use strict';

const js = require('../utils/js-generics');
const CardSet = require('../models/card-set');
const cardService = require('./card-service');

const addPlayedCards = (cardSet, playedCards) => {
    cardSet.playedCards = cardSet.playedCards.concat(playedCards);
};

const create = (decksNumber) => {
    decksNumber = decksNumber || 4;

    var cardSet = new CardSet();
    cardSet.availableCards = (new Array(decksNumber, null)).map(x => cardService.createDeck()).reduce((x, y) => x.concat(y), []);
    cardSet.playedCards = [];

    js.shuffleArray(cardSet.availableCards);

    return cardSet;
};

const getNextCard = (cardSet) => {
    if (cardSet.availableCards.length === 0) {
        throw 'No more cards left!';
    }
    var nextCard = cardSet.availableCards.splice(0, 1)[0];
    return nextCard;
};

const refill = (cardSet) => {
    cardSet.availableCards = cardSet.availableCards.concat(cardSet.playedCards);
    cardSet.playedCards = [];
    js.shuffleArray(cardSet.availableCards);
};

module.exports = {
    addPlayedCards,
    create,
    getNextCard,
    refill
};
