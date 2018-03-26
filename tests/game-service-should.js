const uuidV4 = require('uuid/v4');
const gameService = require('../services/game-service');

(function be_able_to_create_a_game_and_play_a_round() {
    var playerId = uuidV4();
    var gameId = gameService.create(playerId);
    var game = gameService.getGame(gameId);

    gameService.startRound(game);
    gameService.makeDecision(game, playerId, 'Stand');
    gameService.endRound(game);
    gameService.clearRound(game);

    console.log('Test successfully executed')
})();