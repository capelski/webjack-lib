import { Card } from './card';
import { HandStatus } from '../types/hand-status';

export interface Hand {
    bet: number;
    canDouble: boolean;
    canSplit: boolean;
    cards: Card[];
    played: boolean;
    values: number[];
    status: HandStatus;
}

export class Hand implements Hand {
    constructor (public bet: number) {
        this.canDouble = false;
        this.canSplit = false;
        this.cards = [];
        this.played = false;
        this.values = [];
        this.status = HandStatus.Unplayed;
    }
}
