import { Card } from '../models/card';
import { CardSet } from '../models/card-set';
import cardService from '../services/card-service';
import js from '../utils/js-generics';

let developmentCards: Card[];

const collectPlayedCards = (cardSet: CardSet) => {
    cardSet.discardPile = cardSet.discardPile.concat(cardSet.beingPlayed);
    cardSet.beingPlayed = [];
    // TODO Extract the 80 into a configuration parameter
    if (cardSet.discardPile.length > 80) {
        js.shuffleArray(cardSet.discardPile);
        cardSet.unusedCards = cardSet.unusedCards.concat(cardSet.discardPile);
        cardSet.discardPile = [];
    }
};

const createCardSet = (decksNumber: number) => {
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