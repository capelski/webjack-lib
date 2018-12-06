import {GameParameters} from '../models/game-parameters';

let gameParameters: GameParameters = new GameParameters();

const getParameters = () => gameParameters;

const setParameters = (_gameParameters: GameParameters) => {
    gameParameters = {
        ...gameParameters,
        ..._gameParameters
    };
};

export {
    getParameters,
    setParameters
};

export default {
    getParameters,
    setParameters
};