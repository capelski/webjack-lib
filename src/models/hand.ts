import { Card } from './card';

export class Hand{
    canDouble: boolean;
    canSplit: boolean;
    cards: Card[];
    played: boolean;
    values: number[];
    status: string;

    constructor (public bet: number) {
        this.canDouble = false;
        this.canSplit = false;
        this.cards = [];
        this.played = false;
        this.values = [];
        this.status = '';
    }
}
