import { Card } from '../models/card';
import { Player } from '../models/player';
import handService from './hand-service';
const uuidV4 = require('uuid/v4');

let players: Player[] = [];

const createDealer = () => new Player(uuidV4(), 'Dealer');

const createPlayer = (playerName: string) => {
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

const createVirtualPlayer = (playerName: string) => new Player(uuidV4(), playerName);

// TODO Access to models properties should be done in the model service
// e.g. player.hands.reduce(whatever) => handService.whatever

const clearPlayerHands = (player: Player) => {
    player.hands = [];
};

const dealCard = (player: Player, card: Card, isDealer: boolean) => {
    var currentHand = getCurrentHand(player);
    var handStatus = handService.addCard(currentHand, card, isDealer);
    return handStatus;
};

const multiplyCurrentHandValue = (player: Player, multiplier: number) => {
    const currentHand = getCurrentHand(player);
    const currentValue = currentHand.value;
    const nextValue = currentHand.value * multiplier;
    player.earningRate += currentValue - nextValue;
    currentHand.value = nextValue;
};

const getCurrentHand = (player: Player) => player.hands.find(h => !h.played);

const getPlayer = (playerId: string) => players.find(p => p.id == playerId);

const hasHands = (player: Player) => player.hands.length > 0;

const hasUnplayedHands = (player: Player) =>
    player.hands.reduce((unplayedHand, hand) => unplayedHand || !hand.played, false);

const increaseInactiveRounds = (player: Player) => {
    player.inactiveRounds++;
};

const initializeHand = (player: Player, bet?: number) => {
    var hand = handService.create(bet || 0);
    player.hands = [hand];
    player.earningRate -= bet;
};

const resetInactiveRounds = (player: Player) => {
    player.inactiveRounds = 0;
};

const resolveHands = (player: Player, dealerScore: number) => {
    var earningRate = player.hands.reduce((rate, hand) => rate + handService.resolve(hand, dealerScore), 0);
    player.earningRate += earningRate;
};

const splitCurrentHand = (player: Player) => {
    var currentHand = getCurrentHand(player);
    var firstCard = currentHand.cards.splice(-1)[0];

    player.earningRate -= currentHand.value;
    var newHand = handService.create(currentHand.value);
    handService.addCard(newHand, firstCard, false);

    var index = player.hands.findIndex(h => h == currentHand);
    player.hands.splice(index + 1, 0, newHand);
};

export {
    clearPlayerHands,
    createDealer,
    createPlayer,
    createVirtualPlayer,
    dealCard,
    multiplyCurrentHandValue,
    getCurrentHand,
    getPlayer,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    initializeHand,
    resetInactiveRounds,
    resolveHands,
    splitCurrentHand
};

export default {
    clearPlayerHands,
    createDealer,
    createPlayer,
    createVirtualPlayer,
    dealCard,
    multiplyCurrentHandValue,
    getCurrentHand,
    getPlayer,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    initializeHand,
    resetInactiveRounds,
    resolveHands,
    splitCurrentHand
};
