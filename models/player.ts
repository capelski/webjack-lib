import { Hand } from './hand';

export class Player {
    earningRate: number;
    hands: Hand[];
    inactiveRounds: number;

    constructor (public id: string, public name: string = 'Unnamed') {
        this.earningRate = 0;
        this.hands = [];
        // this.id = id;
        this.inactiveRounds = 0;
        // this.name = name || 'Unnamed';
    }
}
