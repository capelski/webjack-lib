import tableService from '../services/table-service';

const getSecondsLeft = (date: Date) => {
	let seconds = -1;
	if (date) {
		const diff = date.getTime() - new Date().getTime();
		if (diff >= 0) {
			seconds = Math.floor(diff / 1000);
		}
	}
	return seconds;
};

const serializeTable = (res: any, table: any) => res.send(JSON.stringify({
	players: table.players,
	dealer: table.dealer,
	isVirtualTable: table.isVirtual,
	activePlayerId: (tableService.getActivePlayer(table) || { id: undefined}).id,
	secondsLeft: getSecondsLeft(table.nextAction)
}));

const noTableJoined = (res: any) =>
    res.status(400).send(JSON.stringify({ message: 'No table has been joined' }));
    
export {
    noTableJoined,
    serializeTable
}; 

export default {
    noTableJoined,
    serializeTable
}; 