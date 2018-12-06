import { CardSet } from './card-set';
import { Player } from './player';

export class Table {
    cardSet: CardSet;
    isRoundBeingPlayed: boolean;
    isVirtual: boolean;
    nextAction: Date;
    nextTrigger: number;
    players: Player[];

    constructor (public id: string, public dealer: Player, cardSet: CardSet) {
        this.cardSet = cardSet;
        this.isRoundBeingPlayed = false;
        this.isVirtual = false;
        this.nextAction = null;
        this.nextTrigger = null;
        this.players = [];
    }
}
