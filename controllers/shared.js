const getSecondsLeft = (date) => {
	let seconds = -1;
	if (date) {
		const diff = date.getTime() - new Date().getTime();
		if (diff >= 0) {
			seconds = Math.floor(diff / 1000);
		}
	}
	return seconds;
};

const serializeTable = (res, table) => res.send(JSON.stringify({
	players: table.players,
	dealer: table.dealer,
	isVirtualTable: table.isVirtual,
	activePlayerId: table.activePlayerId,
	secondsLeft: getSecondsLeft(table.nextAction)
}));

const noTableJoined = res =>
    res.status(400).send(JSON.stringify({ message: 'No table has been joined' }));
    
module.exports = {
    noTableJoined,
    serializeTable
}; 