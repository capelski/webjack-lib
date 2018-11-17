import { Card } from './card';
import { Player } from './player';

export class Table {
    activePlayerId: string;
    availableCards: Card[];
    isVirtual: boolean;
    nextAction: Date;
    nextTrigger: number;
    playedCards: Card[];
    players: Player[];

    constructor (public id: string, cards: Card[], public dealer: Player) {
        this.activePlayerId = null;
        this.availableCards = cards;
        // this.dealer = dealer;
        // this.id = id;
        this.isVirtual = false;
        this.nextAction = null;
        this.nextTrigger = null;
        this.playedCards = [];
        this.players = [];
    }
}
