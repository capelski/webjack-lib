'use strict';

const Player = require('../models/player');
const handService = require('./hand-service');

let players = [];

// TODO Create the id from this service
const create = (id, name) => {
    // TODO Throw exception if no name
    // TODO Check player name does not exist (and != Dealer)
    const player = new Player(id, name);
    players.push(player);
    return player;
}

// TODO Access to models properties should be done in the model service
// e.g. player.hands.reduce(whatever) => handService.whatever

const collectPlayedCards = (player) => {
    var cards = player.hands.reduce((cards, hand) => cards.concat(handService.getCards(hand)), []);
    player.hands = [];
    return cards;
};

const dealCard = (player, card) => {
    var currentHand = getCurrentHand(player);
    var handStatus = handService.addCard(currentHand, card);
    return handStatus;
};

const doubleCurrentHand = (player) => {
    var currentHand = getCurrentHand(player);
    player.earningRate -= currentHand.value;
    currentHand.value += 1;
};

const getCurrentHand = (player) => player.hands.find(h => !h.played);

const getPlayer = playerId => players.find(p => p.id == playerId);

const hasHands = (player) => player.hands.length > 0;

const hasUnplayedHands = (player) =>
    player.hands.reduce((unplayedHand, hand) => unplayedHand || !hand.played, false);

const initializeHand = (player, bet) => {
    var hand = handService.create(bet);
    player.hands = [hand];
    player.earningRate -= bet;
};

const resolveHands = (player, dealerScore) => {
    var earningRate = player.hands.reduce((rate, hand) => rate + handService.resolve(hand, dealerScore), 0);
    player.earningRate += earningRate;
};

const splitCurrentHand = (player) => {
    var currentHand = getCurrentHand(player);
    var firstCard = currentHand.cards.splice(-1)[0];

    player.earningRate -= currentHand.value;
    var newHand = handService.create(currentHand.value);
    handService.addCard(newHand, firstCard);

    var index = player.hands.findIndex(h => h == currentHand);
    player.hands.splice(index + 1, 0, newHand);
};

module.exports = {
    collectPlayedCards,
    create,
    dealCard,
    doubleCurrentHand,
    getCurrentHand,
    getPlayer,
    hasHands,
    hasUnplayedHands,
    initializeHand,
    resolveHands,
    splitCurrentHand
};
