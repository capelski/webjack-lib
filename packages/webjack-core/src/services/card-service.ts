import { ICard } from '../types/card';
import { cartesianProduct } from '../utils/js-generics';

const cardsValue: { [key: string]: number[] } = {
    'A': [1, 11],
    '2': [2],
    '3': [3],
    '4': [4],
    '5': [5],
    '6': [6],
    '7': [7],
    '8': [8],
    '9': [9],
    '10': [10],
    'J': [10],
    'Q': [10],
    'K': [10]
};
const symbols = Object.keys(cardsValue);
const suits = ['\u2663', '\u2666', '\u2665', '\u2660'];

export const createDeck = (): ICard[] =>
    cartesianProduct(suits, symbols, (suit, symbol) => ({ suit, symbol }));

export const getValue = (card: ICard) => cardsValue[card.symbol];