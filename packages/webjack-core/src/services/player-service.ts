import { v4 as uuid } from 'uuid';
import { Player } from '../models/player';
import { Card } from '../models/card';
import { HandStatus } from '../types/hand-status';
import { addCard, createHand, doubleBet, finishHand, isUnplayed } from './hand-service';

let players: Player[] = [];

export const clearHands = (player: Player) => player.hands = [];

export const createDealer = () => new Player(uuid(), 'Dealer');

export const createPlayer = (playerName: string) => {
    const player = new Player(uuid(), playerName);
    players.push(player);
    return player;
};

export const deletePlayer = (playerId: string) => {
    players = players.filter(player => player.id !== playerId);
};

export const double = (player: Player, nextCard: Card) => {
    const currentHand = getCurrentHand(player)!;
    const currentBet = currentHand.bet;
    doubleBet(currentHand);
    updateEarningRate(player, -currentBet);
    addCard(currentHand, nextCard);
    if (currentHand.status === HandStatus.Unplayed) {
        finishHand(currentHand);
    }
};

export const getCurrentHand = (player: Player) => player.hands.find(isUnplayed);

export const getPlayerById = (playerId: string) => players.find(p => p.id === playerId);

export const getPlayerByName = (name: string) =>
    players.find(p => p.name.toLowerCase() === name.toLowerCase());

export const hit = (player: Player, nextCard: Card) => {
    const currentHand = getCurrentHand(player)!;
    addCard(currentHand, nextCard);
};

export const increaseInactiveRounds = (player: Player) => {
    player.inactiveRounds++;
};

export const initializeHand = (player: Player, bet: number) => {
    player.hands = [createHand(bet)];
    updateEarningRate(player, -bet);
};

export const isPlaying = (player: Player) => player.hands.length > 0;

export const resetInactiveRounds = (player: Player) => player.inactiveRounds = 0;

export const split = (player: Player, nextCard: Card) => {
    const currentHand = getCurrentHand(player)!;
    const currentHandIndex = player.hands.findIndex(hand => hand === currentHand);
    const newHand = createHand(currentHand.bet);
    player.hands.splice(currentHandIndex + 1, 0, newHand);

    const handLastCard = currentHand.cards.splice(-1)[0];
    addCard(newHand, handLastCard);
    addCard(currentHand, nextCard);

    updateEarningRate(player, -currentHand.bet);
};

export const stand = (player: Player) => {
    const currentHand = getCurrentHand(player)!;
    finishHand(currentHand);
};

export const updateEarningRate = (player: Player, earningRateVariation: number) => {
    player.earningRate += earningRateVariation;
};
