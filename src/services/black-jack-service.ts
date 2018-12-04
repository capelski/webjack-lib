import { Player } from '../models/player';
import handService from '../services/hand-service';
import playerService from '../services/player-service';
import { Hand } from '../models/hand';
import { HandStatus } from '../models/hand-status';

const isBlackJack = (hand: Hand) => isMaxValue(hand) && hand.cards.length === 2;

const isBurned = (hand: Hand) => handService.getValue(hand) > 21;

const isMaxValue = (hand: Hand) => handService.getValue(hand) === 21;

// TODO Set the bet to 0 after updating player earningRate
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

    return hand.bet * (
        2.5 * +(hand.status === 'BlackJack!') +
        2 * +(hand.status === 'Player wins') +
        1 * +(hand.status === 'Push'));
};

const splitPlayerCurrentHand = (player: Player) => {
    const playerCurrentHand = playerService.getCurrentHand(player);
    const handLastCard = playerCurrentHand.cards.splice(-1)[0];

    const newHand = handService.create(playerCurrentHand.bet);
    handService.addCard(newHand, handLastCard);

    const index = player.hands.findIndex(hand => hand == playerCurrentHand);
    player.hands.splice(index + 1, 0, newHand);

    player.earningRate -= playerCurrentHand.bet;
};

export {
    isBlackJack,
    isBurned,
    isMaxValue,
    resolveHand,
    splitPlayerCurrentHand
};

export default {
    isBlackJack,
    isBurned,
    isMaxValue,
    resolveHand,
    splitPlayerCurrentHand
};