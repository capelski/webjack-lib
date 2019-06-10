import {
    DecisionsSetGetter,
    IDecisionsSet,
    IHandDecisionsData,
    INumberDictionary,
    IOptimalDecision
} from '../types/basic-strategy';
import { IHand } from '../types/hand';
import { PlayerActions } from '../types/player-actions';

const nNumbers = (n: number) =>
    ' '
        .repeat(n)
        .split('')
        .map((_, index) => index + 1);

const numberRange = (min: number, max: number) => nNumbers(max).filter(x => x >= min);

const extendDecisionSet = (
    previousDecisionSet: IDecisionsSet,
    action: string,
    startScore: number,
    endScore: number
) => {
    return numberRange(startScore, endScore).reduce(
        (target, propertyName) => ({
            ...target,
            [propertyName]: action
        }),
        previousDecisionSet
    );
};

const createDecisionsSet = (
    action: string,
    startScore?: number,
    previousDecisionSet?: IDecisionsSet
): IDecisionsSet => {
    const currentDecisionsSet: IDecisionsSet = {
        ...extendDecisionSet(
            // tslint:disable-next-line:no-object-literal-type-assertion
            previousDecisionSet || ({} as IDecisionsSet),
            action,
            startScore || 2,
            11
        ),
        until: {
            dealer: limitScore => {
                return {
                    then: {
                        double: createDecisionsSet(
                            PlayerActions.Double,
                            limitScore + 1,
                            currentDecisionsSet
                        ),
                        hit: createDecisionsSet(
                            PlayerActions.Hit,
                            limitScore + 1,
                            currentDecisionsSet
                        ),
                        split: createDecisionsSet(
                            PlayerActions.Split,
                            limitScore + 1,
                            currentDecisionsSet
                        ),
                        stand: createDecisionsSet(
                            PlayerActions.Stand,
                            limitScore + 1,
                            currentDecisionsSet
                        )
                    }
                };
            }
        }
    };
    return currentDecisionsSet;
};

const double = createDecisionsSet(PlayerActions.Double);
const hit = createDecisionsSet(PlayerActions.Hit);
const split = createDecisionsSet(PlayerActions.Split);
const stand = createDecisionsSet(PlayerActions.Stand);

const softHandsMap: INumberDictionary<IDecisionsSet> = {
    13: hit,
    14: hit,
    15: hit,
    16: hit,
    17: hit,
    18: stand.until.dealer(8).then.hit,
    19: stand,
    20: stand,
    21: stand
};

const hardHandsMap: INumberDictionary<IDecisionsSet> = {
    5: hit,
    6: hit,
    7: hit,
    8: hit,
    9: hit.until.dealer(2).then.double.until.dealer(6).then.hit,
    10: double.until.dealer(9).then.hit,
    11: double.until.dealer(9).then.hit,
    12: hit.until.dealer(3).then.stand.until.dealer(6).then.hit,
    13: stand.until.dealer(6).then.hit,
    14: stand.until.dealer(6).then.hit,
    15: stand.until.dealer(6).then.hit,
    16: stand.until.dealer(6).then.hit,
    17: stand,
    18: stand,
    19: stand,
    20: stand,
    21: stand
};

const splittableHandDecisions: DecisionsSetGetter[] = [
    decisionsData =>
        /^A,A$/.test(decisionsData.symbols) ? split.until.dealer(10).then.hit : undefined,
    decisionsData =>
        /^9,9$/.test(decisionsData.symbols)
            ? split.until
                  .dealer(6)
                  .then.stand.until.dealer(7)
                  .then.split.until.dealer(9).then.stand
            : undefined,
    decisionsData =>
        /^8,8$/.test(decisionsData.symbols) ? split.until.dealer(9).then.hit : undefined,
    decisionsData =>
        /^7,7$/.test(decisionsData.symbols) ? split.until.dealer(7).then.hit : undefined,
    decisionsData =>
        /^6,6$/.test(decisionsData.symbols) ? split.until.dealer(6).then.hit : undefined,
    decisionsData =>
        /^4,4$/.test(decisionsData.symbols)
            ? hit.until.dealer(4).then.split.until.dealer(6).then.hit
            : undefined,
    decisionsData =>
        /^3,3$/.test(decisionsData.symbols) ? split.until.dealer(7).then.hit : undefined,
    decisionsData =>
        /^2,2$/.test(decisionsData.symbols) ? split.until.dealer(7).then.hit : undefined
];

const softHandDecisions: DecisionsSetGetter = decisionsData =>
    decisionsData.values.length > 1 ? softHandsMap[decisionsData.value] : undefined;

const hardHandDecisions: DecisionsSetGetter = decisionsData => hardHandsMap[decisionsData.value];

const allHandsDecisions = splittableHandDecisions
    .concat(softHandDecisions)
    .concat(hardHandDecisions);

const getHandDecisionsData = (hand: IHand): IHandDecisionsData => ({
    symbols: hand.cards.map(c => c.symbol).join(','),
    value: hand.values[hand.values.length - 1],
    values: hand.values
});

export const getOptimalDecision = (hand: IHand, dealerHandValue: number): IOptimalDecision => {
    const handDecisionsData = getHandDecisionsData(hand);
    const decisionsSet = allHandsDecisions.reduce(
        (_decisionsSet, decisionsSetGetter) =>
            _decisionsSet || decisionsSetGetter(handDecisionsData),
        (undefined as unknown) as IDecisionsSet
    );
    const action = decisionsSet[dealerHandValue];

    return {
        action,
        description: `The optimal decision for ${handDecisionsData.values.join('/')} (${
            handDecisionsData.symbols
        }) against a dealer ${dealerHandValue} is to ${action}`
    };
};
