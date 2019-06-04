import { v4 as uuid } from 'uuid';
import { IPlayer } from '../models/player';
import { ICard } from '../models/card';
import { HandStatus } from '../types/hand-status';
import { addCard, createHand, doubleBet, finishHand, isUnplayed } from './hand-service';

let players: IPlayer[] = [];

export const clearHands = (player: IPlayer) => player.hands = [];

const create = (name: string = 'Unnamed'): IPlayer => ({
    id: uuid(),
    earningRate: 0,
    hands: [],
    inactiveRounds: 0,
    name
});

export const createDealer = () => create('Dealer');

export const createPlayer = (playerName: string) => {
    const player = create(playerName);
    players.push(player);
    return player;
};

export const deletePlayer = (playerId: string) => {
    players = players.filter(player => player.id !== playerId);
};

export const double = (player: IPlayer, nextCard: ICard) => {
    const currentHand = getCurrentHand(player)!;
    const currentBet = currentHand.bet;
    doubleBet(currentHand);
    updateEarningRate(player, -currentBet);
    addCard(currentHand, nextCard);
    if (currentHand.status === HandStatus.Unplayed) {
        finishHand(currentHand);
    }
};

export const getCurrentHand = (player: IPlayer) => player.hands.find(isUnplayed);

export const getPlayerById = (playerId: string) => players.find(p => p.id === playerId);

export const getPlayerByName = (name: string) =>
    players.find(p => p.name.toLowerCase() === name.toLowerCase());

export const hit = (player: IPlayer, nextCard: ICard) => {
    const currentHand = getCurrentHand(player)!;
    addCard(currentHand, nextCard);
};

export const increaseInactiveRounds = (player: IPlayer) => {
    player.inactiveRounds++;
};

export const initializeHand = (player: IPlayer, bet: number) => {
    player.hands = [createHand(bet)];
    updateEarningRate(player, -bet);
};

export const isPlaying = (player: IPlayer) => player.hands.length > 0;

export const resetInactiveRounds = (player: IPlayer) => player.inactiveRounds = 0;

export const split = (player: IPlayer, nextCard: ICard) => {
    const currentHand = getCurrentHand(player)!;
    const currentHandIndex = player.hands.findIndex(hand => hand === currentHand);
    const newHand = createHand(currentHand.bet);
    player.hands.splice(currentHandIndex + 1, 0, newHand);

    const handLastCard = currentHand.cards.splice(-1)[0];
    addCard(newHand, handLastCard);
    addCard(currentHand, nextCard);

    updateEarningRate(player, -currentHand.bet);
};

export const stand = (player: IPlayer) => {
    const currentHand = getCurrentHand(player)!;
    finishHand(currentHand);
};

export const updateEarningRate = (player: IPlayer, earningRateVariation: number) => {
    player.earningRate += earningRateVariation;
};
