import { Card } from '../models/card';
import { Hand } from '../models/hand';
import cardService from './card-service';
import js from '../utils/js-generics';
import { HandStatus } from '../models/hand-status';

const addCard = (hand: Hand, card: Card) => {
    hand.cards.push(card);
    hand.values = hand.cards.reduce(handValuesReducer, [0]);
};

const create = (bet: number) => new Hand(bet);

const getBet = (hand: Hand) => hand.bet;

const getCards = (hand: Hand) => hand.cards;

const getValue = (hand: Hand) => hand.values[hand.values.length - 1];

const handValuesReducer = (reducedValues: number[], card: Card) => {
    const cardValues = cardService.getValue(card);
    const nextValuesCandidates = js.cartesianProduct(reducedValues, cardValues, (x, y) => x + y);
    let nextValues = js.removeDuplicates(nextValuesCandidates);

    if (nextValues.indexOf(21) > -1) {
        nextValues = [21];
    }

    if (nextValues.length > 1) {
       nextValues = nextValues.filter(x => x < 22);
    }

    return nextValues;
};

const isAlreadyPlayed = (hand: Hand) => hand.played;

const markAsPlayed = (hand: Hand) => {
    hand.played = true;
};

const setBet = (hand: Hand, bet: number) => {
    hand.bet = bet;
};

const setStatus = (hand: Hand, status: HandStatus) => {
    hand.status = status;
};

export {
    addCard,
    create,
    getBet,
    getCards,
    getValue,
    isAlreadyPlayed,
    markAsPlayed,
    setBet,
    setStatus
};

export default {
    addCard,
    create,
    getBet,
    getCards,
    getValue,
    isAlreadyPlayed,
    markAsPlayed,
    setBet,
    setStatus
};
