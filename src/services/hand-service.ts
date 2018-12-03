import { Card } from '../models/card';
import { Hand } from '../models/hand';
import cardService from './card-service';
import js from '../utils/js-generics';

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

const isBlackJack = (hand: Hand, isDealer: boolean) => {
    const _isBlackJack = getScore(hand) === 21 && hand.cards.length === 2;
    if (_isBlackJack && !isDealer) {
        hand.status = 'BlackJack!';
    }
    return _isBlackJack;
};

const isMaxScore = (hand: Hand) => getScore(hand) === 21;

const isOverMaxScore = (hand: Hand, isDealer: boolean) => {
    const _isOverMaxScore = getScore(hand) > 21;
    if (_isOverMaxScore && !isDealer) {
        hand.status = 'Dealer wins';
    }
    return _isOverMaxScore;
};

const markAsPlayed = (hand: Hand) => {
    hand.played = true;
};

const addCard = (hand: Hand, card: Card, isDealer: boolean) => {
    hand.cards.push(card);
    setScore(hand);
    hand.canDouble = canDouble(hand);
    hand.canSplit = canSplit(hand);
    const isHandAlive = !isBlackJack(hand, isDealer) && !isOverMaxScore(hand, isDealer) && !isMaxScore(hand);
    // TODO This logic shouldn't be here but in the orchestration service
    if (!isHandAlive) {
        markAsPlayed(hand);
    }

    return {
        score: getScore(hand),
        isHandAlive
    };
};

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

export {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    markAsPlayed,
    resolve
};

export default {
    addCard,
    canDouble,
    canSplit,
    create,
    getCards,
    markAsPlayed,
    resolve
};
