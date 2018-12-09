import { Player } from '../models/player';
import { Hand } from '../models/hand';
import handService from './hand-service';

const uuidV4 = require('uuid/v4');

let players: Player[] = [];

const createDealer = () => new Player(uuidV4(), 'Dealer');

const createPlayer = (playerName: string) => {
    if (!playerName || !playerName.trim()) throw 'No player name was provided';
    playerName = playerName.trim();
    
    if (playerName.toLowerCase() == 'dealer') throw 'So you think you are funny, huh? Choose another name';

    const existingPlayer = players.find(p => p.name.toLowerCase() == playerName.toLowerCase());
    if (existingPlayer) {
        throw playerName + ' is already taken. Please choose another name';
    }

    const player = new Player(uuidV4(), playerName);
    players.push(player);
    return player;
}

const createRobot = (playerName: string) => new Player(uuidV4(), playerName);

const getCurrentHand = (player: Player) => player.hands.find(hand => !handService.isAlreadyPlayed(hand));

const getHands = (player: Player) => player.hands;

const getId = (player: Player) => player.id;

const getPlayerById = (playerId: string) => players.find(p => p.id == playerId);

const hasHands = (player: Player) => player.hands.length > 0;

const hasUnplayedHands = (player: Player) =>
    player.hands.reduce((unplayedHand, hand) => unplayedHand || !handService.isAlreadyPlayed(hand), false);

const increaseEarningRate = (player: Player, earningRateVariation: number) => {
    player.earningRate += earningRateVariation;
};

const increaseInactiveRounds = (player: Player) => {
    player.inactiveRounds++;
};

const setHands = (player: Player, hands: Hand[]) => {
    player.hands = hands;
};

const setInactiveRounds = (player: Player, inactiveRounds: number) => {
    player.inactiveRounds = inactiveRounds;
};

const updateEarningRate = (player: Player, earningRate: number) => {
    player.earningRate += earningRate;
};

export {
    createDealer,
    createPlayer,
    createRobot,
    getCurrentHand,
    getHands,
    getId,
    getPlayerById,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    increaseEarningRate,
    setInactiveRounds,
    setHands,
    updateEarningRate
};

export default {
    createDealer,
    createPlayer,
    createRobot,
    getCurrentHand,
    getHands,
    getId,
    getPlayerById,
    hasHands,
    hasUnplayedHands,
    increaseInactiveRounds,
    increaseEarningRate,
    setInactiveRounds,
    setHands,
    updateEarningRate
};
