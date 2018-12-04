import { Card } from '../models/card';
import { Hand } from '../models/hand';
import cardService from './card-service';
import js from '../utils/js-generics';

interface HandMetrics {
    isBlackJack: boolean;
    isMaxScore: boolean;
    isBurned: boolean;
}

const getCards = (hand: Hand) => hand.cards;

const canDouble = (hand: Hand) => getScore(hand) > 8 && getScore(hand) < 12;

const canSplit = (hand: Hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const create = (bet: number) => new Hand(bet);

const getScore = (hand: Hand) => hand.scores[hand.scores.length - 1];

const setScore = (hand: Hand) => {
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
    hand.scores = hand.cards.reduce(handReducer, [0]);
};

const isBlackJack = (hand: Hand) => isMaxScore(hand) && hand.cards.length === 2;

const isMaxScore = (hand: Hand) => getScore(hand) === 21;

const isBurned = (hand: Hand) => getScore(hand) > 21;

const markAsPlayed = (hand: Hand) => {
    hand.played = true;
};

const addCard = (hand: Hand, card: Card) => {
    hand.cards.push(card);
    setScore(hand);
    hand.canDouble = canDouble(hand);
    hand.canSplit = canSplit(hand);
};

const getHandMetrics = (hand: Hand): HandMetrics => {
    return {
        isBlackJack: isBlackJack(hand),
        isMaxScore: isMaxScore(hand),
        isBurned: isBurned(hand)
    };
}

const resolve = (hand: Hand, dealerScore: number) => {
    const score = getScore(hand);
    if (score > 21) {
        hand.status = 'Dealer wins';
    }
    else if (score === 21 && hand.cards.length === 2) {
        hand.status = 'BlackJack!';
    }
    else if (dealerScore > 21) {
        hand.status = 'Player wins';
    }
    else if (score === dealerScore) {
        hand.status = 'Push';
    }
    else {
        hand.status = score > dealerScore ? 'Player wins' : 'Dealer wins';
    }

    return hand.bet * (
        2.5 * +(hand.status === 'BlackJack!') +
        2 * +(hand.status === 'Player wins') +
        1 * +(hand.status === 'Push') +
        0 * +(hand.status === 'Dealer wins'));
};

const setHandStatus = (hand: Hand, handMetrics: HandMetrics) => {
    if (handMetrics.isBurned) {
        hand.status = 'Dealer wins';
    }
    if (handMetrics.isBlackJack) {
        hand.status = 'BlackJack!';
    }
    hand.played = handMetrics.isBlackJack || handMetrics.isMaxScore || handMetrics.isBurned;
}

export {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    getHandMetrics,
    getScore,
    markAsPlayed,
    resolve,
    setHandStatus
};

export default {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    getHandMetrics,
    getScore,
    markAsPlayed,
    resolve,
    setHandStatus
};
