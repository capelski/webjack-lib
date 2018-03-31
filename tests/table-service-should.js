const uuidV4 = require('uuid/v4');
const tableService = require('../services/table-service');
const orchestrationService = require('../services/orchestration-service');

(function allow_joining_a_table_and_play_a_round() {
    var playerId = uuidV4();
    var tableId = tableService.joinTable(playerId);
    var table = tableService.getTable(tableId);

    orchestrationService.startRound(table);
    orchestrationService.makeDecision(table, playerId, 'Stand');
    orchestrationService.endRound(table);
    orchestrationService.collectPlayedCards(table);

    console.log('Test successfully executed')
})();