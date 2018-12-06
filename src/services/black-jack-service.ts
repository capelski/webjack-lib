import handService from '../services/hand-service';
import { Hand } from '../models/hand';
import { HandStatus } from '../models/hand-status';
import cardService from './card-service';

const canDouble = (hand: Hand) => handService.getValue(hand) > 8 && handService.getValue(hand) < 12;

const canSplit = (hand: Hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const getHandEarnings = (hand: Hand, dealerHand: Hand) => {
    let earnings = 0;

    if (isBurned(hand)) {
        handService.setStatus(hand, HandStatus.Burned);
        earnings = 0;
    }
    else if (isBlackJack(hand)) {
        handService.setStatus(hand, HandStatus.BlackJack);
        earnings = isBlackJack(dealerHand) ? 1 : 2.5;
    }
    else if (isBurned(dealerHand)) {
        handService.setStatus(hand, HandStatus.PlayerWins);
        earnings = 2;
    }
    else if (isBlackJack(dealerHand)) {
        handService.setStatus(hand, HandStatus.DealerWins);
        earnings = 0;
    }
    else {
        const handValue = handService.getValue(hand);
        const dealerHandValue = handService.getValue(dealerHand);

        if (handValue === dealerHandValue) {
            handService.setStatus(hand, HandStatus.Push);
            earnings = 1;
        }
        else if (handValue > dealerHandValue) {
            handService.setStatus(hand, HandStatus.PlayerWins);
            earnings = 2;
        }
        else {
            handService.setStatus(hand, HandStatus.DealerWins);
            earnings = 0;
        }
    }

    const total = hand.bet * earnings;
    return total;
};

const isBlackJack = (hand: Hand) => isMaxValue(hand) && hand.cards.length === 2;

const isBurned = (hand: Hand) => handService.getValue(hand) > 21;

const isMaxValue = (hand: Hand) => handService.getValue(hand) === 21;

const wasHandSplit = (hand: Hand) => hand.cards.length === 1;

export {
    canDouble,
    canSplit,
    getHandEarnings,
    isBlackJack,
    isBurned,
    isMaxValue,
    wasHandSplit
};

export default {
    canDouble,
    canSplit,
    getHandEarnings,
    isBlackJack,
    isBurned,
    isMaxValue,
    wasHandSplit
};