import { Card } from './card';
import { HandStatus } from '../types/hand-status';

export interface IHand {
    bet: number;
    cards: Card[];
    values: number[];
    status: HandStatus;
}

export class Hand implements IHand {
    cards: Card[];
    values: number[];
    status: HandStatus;
    
    constructor (public bet: number) {
        this.cards = [];
        this.values = [];
        this.status = HandStatus.Unplayed;
    }
}
