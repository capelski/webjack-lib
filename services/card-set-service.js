'use strict';

const js = require('../utils/js-generics');
const Card = require('../models/card');
const CardSet = require('../models/card-set');
const cardService = require('./card-service');

const addPlayedCards = (cardSet, playedCards) => {
    cardSet.playedCards = cardSet.playedCards.concat(playedCards);
};

const newDeck = () => {
    const suits = ['\u2663', '\u2666', '\u2665', '\u2660'];
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return js.cartesianProduct(suits, numbers, (suit, number) => {
        return new Card(suit, number);
    });
};

const shuffle = (cardSet) => {
    js.shuffleArray(cardSet.availableCards);
};

const create = (decksNumber, shuffled) => {
    decksNumber = decksNumber || 4;
    shuffled = shuffled || true;

    var cardSet = new CardSet();

    cardSet.availableCards = js.createArray(decksNumber, (array, index) => {
        return array.concat(newDeck());
    });
    cardSet.playedCards = [];

    if (shuffled) {
        shuffle(cardSet);
    }

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
    shuffle(cardSet);
};

module.exports = {
    addPlayedCards,
    create,
    getNextCard,
    refill,
    shuffle
};
