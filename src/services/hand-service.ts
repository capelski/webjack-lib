import { Card } from '../models/card';
import { Hand } from '../models/hand';
import cardService from './card-service';
import js from '../utils/js-generics';
import { HandStatus } from '../models/hand-status';

const getCards = (hand: Hand) => hand.cards;

const canDouble = (hand: Hand) => getValue(hand) > 8 && getValue(hand) < 12;

const canSplit = (hand: Hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const create = (bet: number) => new Hand(bet);

const getValue = (hand: Hand) => hand.values[hand.values.length - 1];

const updateValues = (hand: Hand) => {
    const handReducer = (result: number[], card: Card) => {
        const values: number[] = js.cartesianProduct(result, cardService.getValue(card), (x, y) => x + y);
        const uniqueValuesDictionary: { [key: string]: number } =
            values.reduce((uniques, next) => ({...uniques, [next]: next}), {});
        const uniqueValuesArray = Object.keys(uniqueValuesDictionary).map(x => parseInt(x));
        let filteredValuesArray = uniqueValuesArray;

        if (uniqueValuesDictionary['21']) {
            filteredValuesArray = [21];
        }

        if (uniqueValuesArray.length > 1) {
           filteredValuesArray = filteredValuesArray.filter(x => x < 22);
        }

        return filteredValuesArray;
    };
    hand.values = hand.cards.reduce(handReducer, [0]);
};

const markAsPlayed = (hand: Hand) => {
    hand.played = true;
};

const addCard = (hand: Hand, card: Card) => {
    hand.cards.push(card);
    updateValues(hand);
    hand.canDouble = canDouble(hand);
    hand.canSplit = canSplit(hand);
};

const setStatus = (hand: Hand, status: HandStatus) => {
    hand.status = status;
}

export {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    getValue,
    markAsPlayed,
    setStatus
};

export default {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    getValue,
    markAsPlayed,
    setStatus
};
