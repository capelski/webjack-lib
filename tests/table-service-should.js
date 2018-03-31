const uuidV4 = require('uuid/v4');
const tableService = require('../services/table-service');

(function allow_joining_a_table_and_play_a_round() {
    var playerId = uuidV4();
    var tableId = tableService.joinTable(playerId);
    var table = tableService.getTable(tableId);

    tableService.startRound(table);
    tableService.makeDecision(table, playerId, 'Stand');
    tableService.endRound(table);
    tableService.collectPlayedCards(table);

    console.log('Test successfully executed')
})();