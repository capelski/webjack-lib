export interface DecisionsSet {
    [key: number]: string;
    until: {
        dealer: (limit: number) => {
            then: {
                double: DecisionsSet;
                hit: DecisionsSet;
                split: DecisionsSet;
                stand: DecisionsSet;
            };
        };
    };
}

export interface HandDecisionsData {
    symbols: string;
    value: number;
    values: number[];
}

export type DecisionsSetGetter = (decisionsData: HandDecisionsData) => undefined | DecisionsSet;

export interface NumberDictionary<T> {
    [key: number]: T;
}

export interface OptimalDecision {
    action: string;
    description: string;
}