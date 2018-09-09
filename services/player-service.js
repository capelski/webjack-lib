'use strict';

const uuidV4 = require('uuid/v4');
const Player = require('../models/player');
const handService = require('./hand-service');

let players = [];

const create = (playerName) => {
    if (!playerName || !playerName.trim()) throw 'No player name was provided';
    playerName = playerName.trim();
    
    if (playerName.toLowerCase() == 'dealer') throw 'So you think you are funny, huh? Choose another name';

    const existingPlayer = players.find(p => p.name.toLowerCase() == playerName.toLowerCase());
    if (existingPlayer) {
        throw playerName + ' is already taken. Please choose another name';
    }

    const player = new Player(uuidV4(), playerName);
    players.push(player);
    return player;
}

const createDealer = () => new Player(uuidV4(), 'Dealer');

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
    createDealer,
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
