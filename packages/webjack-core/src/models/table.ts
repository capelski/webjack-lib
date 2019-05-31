import { CardSet } from './card-set';
import { Player } from './player';

export interface Table {
    baseTimestamp: number | undefined;
    cardSet: CardSet;
    dealer: Player
    id: string;
    isRoundBeingPlayed: boolean; // TODO Replace with status; IDLE, betsPlaced, playerTurn, dealerTurn, etc.
    nextActionTimestamp: number | undefined;
    nextAction: number | undefined;
    players: Player[];
}

export class Table implements Table {
    constructor (public id: string, public dealer: Player, public cardSet: CardSet) {
        this.baseTimestamp = undefined;
        this.isRoundBeingPlayed = false;
        this.nextActionTimestamp = undefined;
        this.nextAction = undefined;
        this.players = [];
    }
}
