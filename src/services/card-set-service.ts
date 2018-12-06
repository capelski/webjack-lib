import { Card } from '../models/card';
import { CardSet } from '../models/card-set';
import cardService from '../services/card-service';
import gameParametersService from '../services/game-parameters-service';
import js from '../utils/js-generics';

let developmentCards: Card[];

const collectPlayedCards = (cardSet: CardSet) => {
    cardSet.discardPile = cardSet.discardPile.concat(cardSet.beingPlayed);
    cardSet.beingPlayed = [];

    const { maxDiscardedCards } = gameParametersService.getParameters();
    if (cardSet.discardPile.length > maxDiscardedCards) {
        js.shuffleArray(cardSet.discardPile);
        cardSet.unusedCards = cardSet.unusedCards.concat(cardSet.discardPile);
        cardSet.discardPile = [];
    }
};

const createCardSet = () => {
    const { decksNumber } = gameParametersService.getParameters();
    const cards = ' '.repeat(decksNumber)
        .split('')
        .map(_ => cardService.createDeck())
        .reduce((x, y) => x.concat(y), []);
    js.shuffleArray(cards);

    return new CardSet(developmentCards ? developmentCards : cards);
}

const getNextCard = (cardSet: CardSet) => {
    const nextCard = cardSet.unusedCards.splice(0, 1)[0];
    cardSet.beingPlayed.push(nextCard);
    return nextCard;
};

const useDevelopmentCards = (cards: Card[]) => developmentCards = cards;

export const exportedMethods = module.exports = {
    collectPlayedCards,
    createCardSet,
    getNextCard,
    useDevelopmentCards
};

export default {
    collectPlayedCards,
    createCardSet,
    getNextCard,
    useDevelopmentCards
};