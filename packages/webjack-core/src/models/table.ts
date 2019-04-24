import { CardSet } from './card-set';
import { Player } from './player';

export interface Table {
    baseTimestamp: number | undefined;
    cardSet: CardSet;
    dealer: Player
    id: string;
    isRoundBeingPlayed: boolean;
    nextActionTimestamp: number | undefined;
    nextTrigger: number | undefined;
    players: Player[];
}

export class Table implements Table {
    constructor (public id: string, public dealer: Player, public cardSet: CardSet) {
        this.baseTimestamp = undefined;
        this.isRoundBeingPlayed = false;
        this.nextActionTimestamp = undefined;
        this.nextTrigger = undefined;
        this.players = [];
    }
}
