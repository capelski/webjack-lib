import { IGameParameters } from '../types/game-parameters';

let gameParameters: IGameParameters = {
    decksNumber: 4,
    maxDiscardedCards: 40,
    maxInactiveRounds: 4,
    maxPlayers: 7
};

export const getParameters = () => gameParameters;

export const setParameters = (_gameParameters: IGameParameters) => {
    gameParameters = {
        ...gameParameters,
        ..._gameParameters
    };
};
