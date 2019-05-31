// TODO Rename the file to updateTableRound
import * as handService from '../services/hand-service';
import * as playerService from '../services/player-service';
import * as tableService from '../services/table-service';
import { getNextCard } from '../services/card-set-service';
import { playDealerTurn } from './play-dealer-turn';

export const moveRoundForward = (tableId: string) => {
    const table = tableService.getTableById(tableId);
    if (!table) {
        return {
            ok: false,
            error: 'No table identified by ' + tableId + ' was found'
        };
    }

    // TODO If not playing a round, return error
    // TODO Use the tableStatus to playDealerTurn

    const currentPlayer = tableService.getCurrentPlayer(table);
    if (currentPlayer) {
        const currentHand = playerService.getCurrentHand(currentPlayer)!;

        if (handService.hasBeenSplit(currentHand)) {
            handService.addCard(currentHand, getNextCard(table.cardSet));
        }

        const isHandFinished = handService.updateHandStatus(currentHand);
        if (isHandFinished) {
            moveRoundForward(tableId);
        }
        else {
            tableService.setNextAction(table, 20, () => {
                // Reuse playerService.stand() when available
                const currentHand = playerService.getCurrentHand(currentPlayer)!;
                handService.markAsPlayed(currentHand);
            });
        }
    }
    else if (tableService.isDealerTurn(table)) {
        tableService.setNextAction(table, 3, () => playDealerTurn(tableId))
    }
};