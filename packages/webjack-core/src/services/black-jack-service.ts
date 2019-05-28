import { CardSet } from '../models/card-set';
import { Hand } from '../models/hand';
import { HandStatus } from '../models/hand-status';
import { Player } from '../models/player';
import cardService from './card-service';
import cardSetService from './card-set-service';
import handService from './hand-service';
import playerService from './player-service';

// TODO Split between HandService and OrchestrationService
const canDouble = (hand: Hand) => handService.getValue(hand) > 8 && handService.getValue(hand) < 12;

const canSplit = (hand: Hand) => hand.cards.length === 2 && cardService.getValue(hand.cards[0])[0] === cardService.getValue(hand.cards[1])[0];

const dealCard = (hand: Hand, cardSet: CardSet) => {
    handService.addCard(hand, cardSetService.getNextCard(cardSet));
};

const doublePlayerHand = (player: Player, cardSet: CardSet) => {
    const currentHand = playerService.getCurrentHand(player)!;

    if (!canDouble(currentHand)) {
        throw 'Doubling is only allowed with 9, 10 or 11 points';
    }

    handService.setBet(currentHand, currentHand.bet * 2);
    playerService.increaseEarningRate(player, -currentHand.bet);
    dealCard(currentHand, cardSet);
    handService.markAsPlayed(currentHand);
};

const getHandEarnings = (hand: Hand, dealerHand: Hand) => {
    let earnings = 0;

    if (isBust(hand)) {
        handService.setStatus(hand, HandStatus.Bust);
        earnings = 0;
    }
    else if (isBlackJack(hand)) {
        handService.setStatus(hand, HandStatus.BlackJack);
        earnings = isBlackJack(dealerHand) ? 1 : 2.5;
    }
    else if (isBust(dealerHand)) {
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

const hitPlayerHand = (player: Player, cardSet: CardSet) => {
    const currentHand = playerService.getCurrentHand(player)!;
    dealCard(currentHand, cardSet);
};

const isBlackJack = (hand: Hand) => isMaxValue(hand) && hand.cards.length === 2;

const isBust = (hand: Hand) => handService.getValue(hand) > 21;

const isMaxValue = (hand: Hand) => handService.getValue(hand) === 21;

const splitPlayerHand = (player: Player, cardSet: CardSet) => {
    const currentHand = playerService.getCurrentHand(player)!;

    if (!canSplit(currentHand)) {
        throw 'Splitting is only allowed with two equal cards!';
    }

    const handLastCard = currentHand.cards.splice(-1)[0];

    const newHand = handService.create(currentHand.bet);
    handService.addCard(newHand, handLastCard);

    const index = player.hands.findIndex(hand => hand == currentHand);
    player.hands.splice(index + 1, 0, newHand);

    dealCard(currentHand, cardSet);

    playerService.increaseEarningRate(player, -currentHand.bet);
};

const standPlayerHand = (player: Player) => {
    const playerHand = playerService.getCurrentHand(player)!;
    handService.markAsPlayed(playerHand);
};

const wasHandSplit = (hand: Hand) => hand.cards.length === 1;

export {
    canDouble,
    canSplit,
    dealCard,
    doublePlayerHand,
    getHandEarnings,
    hitPlayerHand,
    isBlackJack,
    isBust,
    isMaxValue,
    splitPlayerHand,
    standPlayerHand,
    wasHandSplit
};

export default {
    canDouble,
    canSplit,
    dealCard,
    doublePlayerHand,
    getHandEarnings,
    hitPlayerHand,
    isBlackJack,
    isBust,
    isMaxValue,
    splitPlayerHand,
    standPlayerHand,
    wasHandSplit
};