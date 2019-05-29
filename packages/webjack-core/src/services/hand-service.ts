import { Card } from '../models/card';
import { Hand } from '../models/hand';
import cardService from './card-service';
import js from '../utils/js-generics';
import { HandStatus } from '../models/hand-status';

const addCard = (hand: Hand, card: Card) => {
    hand.cards.push(card);
    hand.values = hand.cards.reduce(handValuesReducer, [0]);
};

const canDouble = (hand: Hand) => getValue(hand) > 8 && getValue(hand) < 12;

const canSplit = (hand: Hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const create = (bet: number) => new Hand(bet);

// TODO Split into to functions => resolve + getEarnings
const getHandEarnings = (hand: Hand, dealerHand: Hand) => {
    let earnings = 0;

    if (isBust(hand)) {
        setStatus(hand, HandStatus.Bust);
        earnings = 0;
    }
    else if (isBlackJack(hand)) {
        setStatus(hand, HandStatus.BlackJack);
        earnings = isBlackJack(dealerHand) ? 1 : 2.5;
    }
    else if (isBust(dealerHand)) {
        setStatus(hand, HandStatus.PlayerWins);
        earnings = 2;
    }
    else if (isBlackJack(dealerHand)) {
        setStatus(hand, HandStatus.DealerWins);
        earnings = 0;
    }
    else {
        const handValue = getValue(hand);
        const dealerHandValue = getValue(dealerHand);

        if (handValue === dealerHandValue) {
            setStatus(hand, HandStatus.Push);
            earnings = 1;
        }
        else if (handValue > dealerHandValue) {
            setStatus(hand, HandStatus.PlayerWins);
            earnings = 2;
        }
        else {
            setStatus(hand, HandStatus.DealerWins);
            earnings = 0;
        }
    }

    const total = hand.bet * earnings;
    return total;
};

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

const isBlackJack = (hand: Hand) => isMaxValue(hand) && hand.cards.length === 2;

const isBust = (hand: Hand) => getValue(hand) > 21;

const isMaxValue = (hand: Hand) => getValue(hand) === 21;

const markAsPlayed = (hand: Hand) => {
    hand.played = true;
};

const setBet = (hand: Hand, bet: number) => {
    hand.bet = bet;
};

const setStatus = (hand: Hand, status: HandStatus) => {
    hand.status = status;
};

const updateHandStatus = (playerHand: Hand) => {
    const _isBlackJack = isBlackJack(playerHand);
    const _isBust = isBust(playerHand);
    const _isMaxValue = isMaxValue(playerHand);

    if (_isBust) {
        setStatus(playerHand, HandStatus.Bust);
    }
    else if (_isBlackJack) {
        setStatus(playerHand, HandStatus.BlackJack);
    }
    
    const isHandFinished = _isBlackJack || _isBust || _isMaxValue;
    
    if (isHandFinished) {
        markAsPlayed(playerHand);
    }

    return isHandFinished;
};

// TODO Rename to hasBeenSplit
const wasHandSplit = (hand: Hand) => hand.cards.length === 1;

export {
    addCard,
    canDouble,
    canSplit,
    create,
    getHandEarnings,
    getValue,
    isAlreadyPlayed,
    isBlackJack,
    isBust,
    isMaxValue,
    markAsPlayed,
    setBet,
    setStatus,
    updateHandStatus,
    wasHandSplit
};

export default {
    addCard,
    canDouble,
    canSplit,
    create,
    getHandEarnings,
    getValue,
    isAlreadyPlayed,
    isBlackJack,
    isBust,
    isMaxValue,
    markAsPlayed,
    setBet,
    setStatus,
    updateHandStatus,
    wasHandSplit
};
