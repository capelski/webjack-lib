import { CardSet } from './card-set';
import { Player } from './player';

export class Table {
    activePlayerId: string;
    cardSet: CardSet;
    isRoundBeingPlayed: boolean;
    isVirtual: boolean;
    nextAction: Date;
    nextTrigger: number;
    players: Player[];

    constructor (public id: string, cardSet: CardSet, public dealer: Player) {
        this.activePlayerId = null;
        this.cardSet = cardSet;
        this.isRoundBeingPlayed = false;
        this.isVirtual = false;
        this.nextAction = null;
        this.nextTrigger = null;
        this.players = [];
    }
}
