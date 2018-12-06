export interface GameParameters {
	decksNumber: number;
	maxDiscardedCards: number;
	maxPlayers: number;
	maxInactiveRounds: number;
}

export class GameParameters implements GameParameters {    
    constructor () {
        this.decksNumber = 4;
	    this.maxDiscardedCards = 40;
	    this.maxPlayers = 7;
	    this.maxInactiveRounds = 4;
    }
}