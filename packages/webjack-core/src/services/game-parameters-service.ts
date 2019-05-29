import { GameParameters } from '../models/game-parameters';

let gameParameters: GameParameters = new GameParameters();

export const getParameters = () => gameParameters;

export const setParameters = (_gameParameters: GameParameters) => {
    gameParameters = {
        ...gameParameters,
        ..._gameParameters
    };
};