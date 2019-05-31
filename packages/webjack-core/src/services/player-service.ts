import { Player } from '../models/player';
import { Hand } from '../models/hand';
import { create as createHand, isUnplayed } from './hand-service';
import { v4 as uuid } from 'uuid';

let players: Player[] = [];

export const clearHands = (player: Player) => player.hands = [];

export const createDealer = () => new Player(uuid(), 'Dealer');

export const createPlayer = (playerName: string) => {
    const player = new Player(uuid(), playerName);
    players.push(player);
    return player;
}

export const deletePlayer = (playerId: string) => {
    players = players.filter(player => player.id !== playerId);
}

export const getCurrentHand = (player: Player) => player.hands.find(isUnplayed);

export const getPlayerById = (playerId: string) => players.find(p => p.id === playerId);

export const getPlayerByName = (name: string) =>
    players.find(p => p.name.toLowerCase() === name.toLowerCase());

export const increaseInactiveRounds = (player: Player) => {
    player.inactiveRounds++;
};

export const initializeHand = (player: Player, bet: number) => {
    player.hands = [createHand(bet)];
    updateEarningRate(player, -bet);
}

export const isPlaying = (player: Player) => player.hands.length > 0;

export const resetInactiveRounds = (player: Player) => player.inactiveRounds = 0;

// TODO Remove
export const setHands = (player: Player, hands: Hand[]) => {
    player.hands = hands;
};

export const updateEarningRate = (player: Player, earningRateVariation: number) => {
    player.earningRate += earningRateVariation;
};
