const uuidV4 = require('uuid/v4');
const tableService = require('../services/table-service');

(function be_able_to_create_a_table_and_play_a_round() {
    var playerId = uuidV4();
    var tableId = tableService.create(playerId);
    var table = tableService.getTable(tableId);

    tableService.startRound(table);
    tableService.makeDecision(table, playerId, 'Stand');
    tableService.endRound(table);
    tableService.collectPlayedCards(table);

    console.log('Test successfully executed')
})();