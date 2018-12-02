import { Player } from '../models/player';
import handService from '../services/hand-service';
import playerService from '../services/player-service';

const splitPlayerCurrentHand = (player: Player) => {
    const playerCurrentHand = playerService.getCurrentHand(player);
    const handLastCard = playerCurrentHand.cards.splice(-1)[0];

    const newHand = handService.create(playerCurrentHand.value);
    handService.addCard(newHand, handLastCard, false);

    const index = player.hands.findIndex(hand => hand == playerCurrentHand);
    player.hands.splice(index + 1, 0, newHand);

    player.earningRate -= playerCurrentHand.value;
};

export {
    splitPlayerCurrentHand
};

export default {
    splitPlayerCurrentHand
};