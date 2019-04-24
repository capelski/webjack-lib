import { Card } from './card';

export interface CardSet {
    unusedCards: Card[];
    beingPlayed: Card[];
    discardPile: Card[];
}

export class CardSet implements CardSet {    
    constructor (cards: Card[]) {
        this.unusedCards = cards;
        this.beingPlayed = [];
        this.discardPile = [];
    }
}
