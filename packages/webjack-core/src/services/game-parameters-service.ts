import { IGameParameters } from '../types/game-parameters';

let gameParameters: IGameParameters = {
    decksNumber: 4,
    maxDiscardedCards: 40,
    maxPlayers: 7,
    maxInactiveRounds: 4
};

export const getParameters = () => gameParameters;

export const setParameters = (_gameParameters: IGameParameters) => {
    gameParameters = {
        ...gameParameters,
        ..._gameParameters
    };
};