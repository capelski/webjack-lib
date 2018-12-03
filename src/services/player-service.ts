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

// TODO DealCard shouldn't return handStatus. Get it from orchestration-service instead
const dealCard = (player: Player, card: Card) => {
    // TODO Deal the card to the hand, not to the player
    const currentHand = getCurrentHand(player);
    handService.addCard(currentHand, card);
};

const getCurrentHand = (player: Player) => player.hands.find(h => !h.played);

const getCurrentHandBet = (player: Player) => {
    const currentHand = getCurrentHand(player);
    return currentHand.bet;
}

const getCurrentHandScore = (player: Player) => {
    const currentHand = getCurrentHand(player);
    return handService.getScore(currentHand);
}

const getPlayer = (playerId: string) => players.find(p => p.id == playerId);

const hasHands = (player: Player) => player.hands.length > 0;

const hasUnplayedHands = (player: Player) =>
    player.hands.reduce((unplayedHand, hand) => unplayedHand || !hand.played, false);

const increaseInactiveRounds = (player: Player) => {
    player.inactiveRounds++;
};

const initializeHand = (player: Player, bet?: number) => {
    const hand = handService.create(bet || 0);
    player.hands = [hand];
    player.earningRate -= bet;
};

const resetInactiveRounds = (player: Player) => {
    player.inactiveRounds = 0;
};

const resolveHands = (player: Player, dealerScore: number) => {
    const earningRate = player.hands.reduce((rate, hand) => rate + handService.resolve(hand, dealerScore), 0);
    player.earningRate += earningRate;
};

const setCurrentHandBet = (player: Player, handBet: number) => {
    const currentHand = getCurrentHand(player);
    const currentBet = currentHand.bet;
    player.earningRate += currentBet - handBet;
    currentHand.bet = handBet;
};

export {
    clearPlayerHands,
    createDealer,
    createPlayer,
    createVirtualPlayer,
    dealCard,
    getCurrentHand,
    getCurrentHandBet,
    getCurrentHandScore,
    getPlayer,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    initializeHand,
    resetInactiveRounds,
    resolveHands,
    setCurrentHandBet
};

export default {
    clearPlayerHands,
    createDealer,
    createPlayer,
    createVirtualPlayer,
    dealCard,
    getCurrentHand,
    getCurrentHandBet,
    getCurrentHandScore,
    getPlayer,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    initializeHand,
    resetInactiveRounds,
    resolveHands,
    setCurrentHandBet
};
