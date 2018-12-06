interface GameParameters {
	decksNumber: number;
	maxDiscardedCards: number;
	maxPlayers: number;
	maxInactiveRounds: number;
}

let gameParameters: GameParameters = {
	decksNumber: 4,
	maxDiscardedCards: 40,
	maxPlayers: 7,
	maxInactiveRounds: 4
};

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