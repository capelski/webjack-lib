'use strict';

let js = require('../utils/js-generics');
let Card = require('../models/card');
let CardSet = require('../models/card-set');
let cardService = require('./card-service');

function cardSetService() {

    function addPlayedCards(cardSet, playedCards) {
        cardSet.playedCards = cardSet.playedCards.concat(playedCards);
    }

    function create(decksNumber, shuffled) {
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
    }

    function getNextCard(cardSet) {
        if (cardSet.availableCards.length === 0) {
            throw 'No more cards left!';
        }
        var nextCard = cardSet.availableCards.splice(0, 1)[0];
        return nextCard;
    }

    function newDeck() {
        let suits = ['\u2663', '\u2666', '\u2665', '\u2660'];
        let numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return js.cartesianProduct(suits, numbers, (suit, number) => {
            return new Card(suit, number);
        });
    }

    function refill(cardSet) {
        cardSet.availableCards = cardSet.availableCards.concat(cardSet.playedCards);
        cardSet.playedCards = [];
        shuffle(cardSet);
    }

    function shuffle(cardSet) {
        js.shuffleArray(cardSet.availableCards);
    }

    function stringify(cardSet) {
        var availableCards = js.stringifyArray(cardSet.availableCards, (card) => {
            return cardService.stringify(card);
        });
        var playedCards = js.stringifyArray(cardSet.playedCards, (card) => {
            return cardService.stringify(card);
        });
        return 'Available cards: ' + availableCards + '<br/>' + 'Played cards: ' + playedCards;
    }

    return {
        addPlayedCards,
        create,
        getNextCard,
        refill,
        shuffle,
        stringify
    };
}

module.exports = cardSetService();
