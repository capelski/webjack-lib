import { Card } from './card';

export class CardSet {
    unusedCards: Card[];
    beingPlayed: Card[];
    discardPile: Card[];
    
    constructor (cards: Card[]) {
        this.unusedCards = cards;
        this.beingPlayed = [];
        this.discardPile = [];
    }
}
