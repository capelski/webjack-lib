const uuidV4 = require('uuid/v4');
const Card = require('../models/card');
const playerService = require('../services/player-service');

(function allow_splitting_valid_hand() {
    var playerId = uuidV4();
    var player = playerService.create(playerId);
    var firstCard = new Card('\u2663', 'J');
    var secondCard = new Card('\u2666', 'K');

    playerService.initializeHand(player);
    playerService.dealCard(player, firstCard);
    playerService.dealCard(player, secondCard);

    playerService.splitCurrentHand(player, secondCard);

    console.log('allow_splitting_valid_hand succeded');
})();