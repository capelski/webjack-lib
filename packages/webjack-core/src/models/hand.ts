import { Card } from './card';
import { HandStatus } from '../types/hand-status';

export interface Hand {
    bet: number;
    cards: Card[];
    values: number[];
    status: HandStatus;
}

export class Hand implements Hand {
    constructor (public bet: number) {
        this.cards = [];
        this.values = [];
        this.status = HandStatus.Unplayed;
    }
}
