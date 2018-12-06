import { Player } from '../models/player';
import cardSetService from '../services/card-set-service';
import handService from '../services/hand-service';
import playerService from '../services/player-service';
import { Hand } from '../models/hand';
import { HandStatus } from '../models/hand-status';
import { CardSet } from '../models/card-set';

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

const splitPlayerCurrentHand = (player: Player, cardSet: CardSet) => {
    const playerCurrentHand = playerService.getCurrentHand(player);

    if (!handService.canSplit(playerCurrentHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }

    const handLastCard = playerCurrentHand.cards.splice(-1)[0];

    const newHand = handService.create(playerCurrentHand.bet);
    handService.addCard(newHand, handLastCard);

    const index = player.hands.findIndex(hand => hand == playerCurrentHand);
    player.hands.splice(index + 1, 0, newHand);

    handService.addCard(playerCurrentHand, cardSetService.getNextCard(cardSet));

    player.earningRate -= playerCurrentHand.bet;
};

const wasHandSplit = (hand: Hand) => hand.cards.length === 1;

export {
    isBlackJack,
    isBurned,
    isMaxValue,
    resolveHand,
    splitPlayerCurrentHand,
    wasHandSplit
};

export default {
    isBlackJack,
    isBurned,
    isMaxValue,
    resolveHand,
    splitPlayerCurrentHand,
    wasHandSplit
};