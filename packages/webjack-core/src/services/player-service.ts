import { Player } from '../models/player';
import { Hand } from '../models/hand';
import { create as createHand, isAlreadyPlayed } from './hand-service';
import { v4 as uuid } from 'uuid';

let players: Player[] = [];

export const createDealer = () => new Player(uuid(), 'Dealer');

export const createPlayer = (playerName: string) => {
    const player = new Player(uuid(), playerName);
    players.push(player);
    return player;
}

// TODO Remove this method an create removePlayer
export const createRobot = (playerName: string) => new Player(uuid(), playerName);

export const getCurrentHand = (player: Player) => player.hands.find(hand => !isAlreadyPlayed(hand));

export const getPlayerById = (playerId: string) => players.find(p => p.id === playerId);

export const getPlayerByName = (name: string) => players.find(p => p.name.toLowerCase() === name.toLowerCase());

export const hasHands = (player: Player) => player.hands.length > 0;

export const hasUnplayedHands = (player: Player) =>
    player.hands.reduce((unplayedHand, hand) => unplayedHand || !isAlreadyPlayed(hand), false);

export const increaseEarningRate = (player: Player, earningRateVariation: number) => {
    player.earningRate += earningRateVariation;
};

export const increaseInactiveRounds = (player: Player) => {
    player.inactiveRounds++;
};

export const initializeHand = (player: Player, bet: number) => {
    const hand = createHand(bet);
    setHands(player, [hand]);
    increaseEarningRate(player, -bet);
}

export const setHands = (player: Player, hands: Hand[]) => {
    player.hands = hands;
};

export const setInactiveRounds = (player: Player, inactiveRounds: number) => {
    player.inactiveRounds = inactiveRounds;
};

export const updateEarningRate = (player: Player, earningRate: number) => {
    player.earningRate += earningRate;
};
