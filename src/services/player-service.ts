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

const getCurrentHand = (player: Player) => player.hands.find(h => !h.played);

const getCurrentHandBet = (player: Player) => {
    const currentHand = getCurrentHand(player);
    return currentHand.bet;
};

const getHands = (player: Player) => player.hands;

const getPlayer = (playerId: string) => players.find(p => p.id == playerId);

const hasHands = (player: Player) => player.hands.length > 0;

const hasUnplayedHands = (player: Player) =>
    player.hands.reduce((unplayedHand, hand) => unplayedHand || !hand.played, false);

const increaseInactiveRounds = (player: Player) => {
    player.inactiveRounds++;
};

// TODO Replace with a setHands?
const initializeHand = (player: Player, bet?: number) => {
    const hand = handService.create(bet || 0);
    player.hands = [hand];
    player.earningRate -= bet;
};

const resetInactiveRounds = (player: Player) => {
    player.inactiveRounds = 0;
};

const setCurrentHandBet = (player: Player, handBet: number) => {
    const currentHand = getCurrentHand(player);
    const currentBet = currentHand.bet;
    player.earningRate += currentBet - handBet;
    currentHand.bet = handBet;
};

const updateEarningRate = (player: Player, earningRate: number) => {
    player.earningRate += earningRate;
};

export {
    clearPlayerHands,
    createDealer,
    createPlayer,
    createVirtualPlayer,
    getCurrentHand,
    getCurrentHandBet,
    getHands,
    getPlayer,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    initializeHand,
    resetInactiveRounds,
    setCurrentHandBet,
    updateEarningRate
};

export default {
    clearPlayerHands,
    createDealer,
    createPlayer,
    createVirtualPlayer,
    getCurrentHand,
    getCurrentHandBet,
    getHands,
    getPlayer,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    initializeHand,
    resetInactiveRounds,
    setCurrentHandBet,
    updateEarningRate
};
