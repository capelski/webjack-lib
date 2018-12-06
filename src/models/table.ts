import { CardSet } from './card-set';
import { Player } from './player';

export interface Table {
    cardSet: CardSet;
    dealer: Player
    id: string;
    isRoundBeingPlayed: boolean;
    isVirtual: boolean;
    nextAction: Date;
    nextTrigger: number;
    players: Player[];
}

export class Table implements Table {
    constructor (public id: string, public dealer: Player, public cardSet: CardSet) {
        this.isRoundBeingPlayed = false;
        this.isVirtual = false;
        this.nextAction = null;
        this.nextTrigger = null;
        this.players = [];
    }
}
