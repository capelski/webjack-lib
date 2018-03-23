'use strict';

let nodeUtils = require('../utils/node');
let js = require('../js-generics');
let PlayerSet = require('../models/player-set');
let playerService = require('./player-service');

function playerSetService() {

    function addPlayer(playerSet, playerName) {
        // TODO Check max capacity
        // TODO Check the game status and add only when no round
        var player = playerService.create(playerSet.players.length, playerName);
        playerSet.players.unshift(player);
    }

    function create(playerNames) {
        playerNames = playerNames || [];

        var id = 0;
        var dealer = playerService.create(id++, 'Dealer');
        var players = playerNames.map(name => playerService.create(id++, name));
        
        var playerSet = new PlayerSet(dealer, players);

        return playerSet;
    }

    function endRound(playerSet) {
        playerSet.currentIndex = null;
    }

    function ensurePlayer(playerSet, playerId) {
        if (playerSet.currentIndex == null) {
            throw 'No round has been started yet!';
        }
        var currentPlayer = playerSet.players[playerSet.currentIndex];
        if (!currentPlayer) {
            throw 'There is no player identified by ' + playerId;
        }        
        else if (currentPlayer.id !== playerId) {
            var ensuredPlayer = getPlayerById(playerSet, playerId);
            throw ensuredPlayer.name + ' can\'t play now! It is ' + currentPlayer.name + '\'s turn';
        }
        else if (currentPlayer.id === getDealer(playerSet).id) {
            throw 'Can\'t play dealer\'s turn!';
        }
        else {
            try {
                playerService.getCurrentHand(currentPlayer);
                return currentPlayer;
            }
            catch (error) {
                startNextTurn(playerSet);
                throw 'Player ' + currentPlayer.name + ' can\'t play anymore this round!';
            }            
        }        
    }

    function getCurrentPlayer(playerSet) {
        return playerSet.players[playerSet.currentIndex];
    }

    function getDealer(playerSet) {
        return playerSet.players[playerSet.players.length - 1];
    }

    function getPlayerById(playerSet, playerId) {
        var player = null;
        var index = 0;
        while (!player && index < playerSet.players.length) {
            if (playerSet.players[index].id === playerId) {
                player = playerSet.players[index];
            }
            ++index;
        }
        return player;
    }

    function startNextTurn(playerSet) {
        var nextPlayer = null;
        while (!nextPlayer && (playerSet.currentIndex < playerSet.players.length - 1)) {            
            nextPlayer = playerSet.players[playerSet.currentIndex];
            if (!playerService.hasUnplayedHand(nextPlayer)) {
                nextPlayer = null;
                playerSet.currentIndex++;
            }            
        }
        return nextPlayer;
    }

    function startRound(playerSet) {
        playerSet.currentIndex = 0;
        startNextTurn(playerSet);
    }

    function stringify(playerSet) {
        var stringifiedSet = js.stringifyArray(playerSet.players, (player) => {
            return playerService.stringify(player, player === getCurrentPlayer(playerSet));
        }, '<br/>') + '<br/>';
        return stringifiedSet;
    }    

    return {
        addPlayer: nodeUtils.trace(playerSetService.name, addPlayer),
        create: nodeUtils.trace(playerSetService.name, create),
        endRound: nodeUtils.trace(playerSetService.name, endRound),
        ensurePlayer: nodeUtils.trace(playerSetService.name, ensurePlayer),
        getDealer: nodeUtils.trace(playerSetService.name, getDealer),
        getCurrentPlayer: nodeUtils.trace(playerSetService.name, getCurrentPlayer),
        getPlayerById: nodeUtils.trace(playerSetService.name, getPlayerById),
        startNextTurn: nodeUtils.trace(playerSetService.name, startNextTurn),
        startRound: nodeUtils.trace(playerSetService.name, startRound),
        stringify: nodeUtils.trace(playerSetService.name, stringify)
    };
}

module.exports = playerSetService();
