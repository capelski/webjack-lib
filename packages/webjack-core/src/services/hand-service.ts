import { ICard } from '../types/card';
import { IHand } from '../types/hand';
import * as cardService from './card-service';
import { cartesianProduct, removeDuplicates } from '../utils/js-generics';
import { HandStatus } from '../types/hand-status';

export const addCard = (hand: IHand, card: ICard) => {
    hand.cards.push(card);
    hand.values = hand.cards.reduce(handValuesReducer, [0]);
    if (isBlackJack(hand)) {
        hand.status = HandStatus.BlackJack;
    } else if (isBust(hand)) {
        hand.status = HandStatus.Bust;
        clearBet(hand);
    } else if (isMaxValue(hand)) {
        hand.status = HandStatus.Unresolved;
    }
};

export const canDouble = (hand: IHand) => getValue(hand) > 8 && getValue(hand) < 12;

export const canSplit = (hand: IHand) =>
    hand.cards.length === 2 &&
    cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

export const clearBet = (hand: IHand) => {
    hand.bet = 0;
};

export const createHand = (bet: number): IHand => ({
    bet,
    cards: [],
    values: [],
    status: HandStatus.Unplayed
});

export const doubleBet = (hand: IHand) => {
    hand.bet = hand.bet * 2;
};

export const finishHand = (hand: IHand) => {
    hand.status = HandStatus.Unresolved;
};

export const getValue = (hand: IHand) => hand.values[hand.values.length - 1];

const handValuesReducer = (reducedValues: number[], card: ICard) => {
    const cardValues = cardService.getValue(card);
    const nextValuesCandidates = cartesianProduct(reducedValues, cardValues, (x, y) => x + y);
    let nextValues = removeDuplicates(nextValuesCandidates);

    if (nextValues.indexOf(21) > -1) {
        nextValues = [21];
    }

    if (nextValues.length > 1) {
        nextValues = nextValues.filter(x => x < 22);
    }

    return nextValues;
};

export const hasBeenSplit = (hand: IHand) => hand.cards.length === 1;

const isBlackJack = (hand: IHand) => isMaxValue(hand) && hand.cards.length === 2;

const isBust = (hand: IHand) => getValue(hand) > 21;

const isMaxValue = (hand: IHand) => getValue(hand) === 21;

export const isUnplayed = (hand: IHand) => hand.status === HandStatus.Unplayed;

export const resolveHand = (hand: IHand, dealerHand: IHand) => {
    let earnings = 0;

    if (isBust(hand)) {
        hand.status = HandStatus.Bust;
        earnings = 0;
    } else if (isBlackJack(hand)) {
        hand.status = HandStatus.BlackJack;
        earnings = isBlackJack(dealerHand) ? 1 : 2.5;
    } else if (isBust(dealerHand)) {
        hand.status = HandStatus.PlayerWins;
        earnings = 2;
    } else if (isBlackJack(dealerHand)) {
        hand.status = HandStatus.DealerWins;
        earnings = 0;
    } else {
        const handValue = getValue(hand);
        const dealerHandValue = getValue(dealerHand);

        if (handValue === dealerHandValue) {
            hand.status = HandStatus.Push;
            earnings = 1;
        } else if (handValue > dealerHandValue) {
            hand.status = HandStatus.PlayerWins;
            earnings = 2;
        } else {
            hand.status = HandStatus.DealerWins;
            earnings = 0;
        }
    }

    const total = hand.bet * earnings;
    return total;
};
