import { Hand } from './hand';

export class Player {
    earningRate: number;
    hands: Hand[];
    inactiveRounds: number;

    constructor (public id: string, public name: string = 'Unnamed') {
        this.earningRate = 0;
        this.hands = [];
        this.inactiveRounds = 0;
    }
}
