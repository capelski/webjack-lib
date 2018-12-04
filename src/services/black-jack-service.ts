import { Player } from '../models/player';
import handService from '../services/hand-service';
import playerService from '../services/player-service';
import { Hand } from '../models/hand';

const isBlackJack = (hand: Hand) => isMaxValue(hand) && hand.cards.length === 2;

const isBurned = (hand: Hand) => handService.getValue(hand) > 21;

const isMaxValue = (hand: Hand) => handService.getValue(hand) === 21;

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
    splitPlayerCurrentHand
};

export default {
    isBlackJack,
    isBurned,
    isMaxValue,
    splitPlayerCurrentHand
};