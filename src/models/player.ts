import { Hand } from './hand';

export interface Player {
    earningRate: number;
    hands: Hand[];
    id: string;
    inactiveRounds: number;
    name: string;
}

export class Player implements Player {
    constructor (public id: string, public name: string = 'Unnamed') {
        this.earningRate = 0;
        this.hands = [];
        this.inactiveRounds = 0;
    }
}
