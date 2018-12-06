import handService from '../services/hand-service';
import { Hand } from '../models/hand';
import { HandStatus } from '../models/hand-status';
import cardService from './card-service';

const canDouble = (hand: Hand) => handService.getValue(hand) > 8 && handService.getValue(hand) < 12;

const canSplit = (hand: Hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const isBlackJack = (hand: Hand) => isMaxValue(hand) && hand.cards.length === 2;

const isBurned = (hand: Hand) => handService.getValue(hand) > 21;

const isMaxValue = (hand: Hand) => handService.getValue(hand) === 21;

const resolveHand = (hand: Hand, dealerHandValue: number) => {
    const handValue = handService.getValue(hand);
    if (handValue > 21) {
        handService.setStatus(hand, HandStatus.Burned);
    }
    else if (handValue === 21 && hand.cards.length === 2) {
        handService.setStatus(hand, HandStatus.BlackJack);
        // TODO Check if dealer has blackjack too!
    }
    else if (dealerHandValue > 21) {
        handService.setStatus(hand, HandStatus.PlayerWins);
        // TODO Check if dealer has blackjack!
    }
    else if (handValue === dealerHandValue) {
        handService.setStatus(hand, HandStatus.Push);
    }
    else {
        handService.setStatus(hand, handValue > dealerHandValue ? HandStatus.PlayerWins : HandStatus.DealerWins);
    }

    const bet = hand.bet;
    hand.bet = 0;

    return bet * (
        2.5 * +(hand.status === 'BlackJack!') +
        2 * +(hand.status === 'Player wins') +
        1 * +(hand.status === 'Push'));
};

const wasHandSplit = (hand: Hand) => hand.cards.length === 1;

export {
    canDouble,
    canSplit,
    isBlackJack,
    isBurned,
    isMaxValue,
    resolveHand,
    wasHandSplit
};

export default {
    canDouble,
    canSplit,
    isBlackJack,
    isBurned,
    isMaxValue,
    resolveHand,
    wasHandSplit
};