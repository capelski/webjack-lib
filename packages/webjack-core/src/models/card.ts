export interface Card {
    suit: string;
    symbol: string;
}

export class Card implements Card {
    constructor (public suit: string, public symbol: string) {
    }
}
