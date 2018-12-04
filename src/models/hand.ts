import { Card } from './card';
import { HandStatus } from './hand-status';

export class Hand{
    canDouble: boolean;
    canSplit: boolean;
    cards: Card[];
    played: boolean;
    values: number[];
    status: HandStatus;

    constructor (public bet: number) {
        this.canDouble = false;
        this.canSplit = false;
        this.cards = [];
        this.played = false;
        this.values = [];
        this.status = HandStatus.Unplayed;
    }
}
