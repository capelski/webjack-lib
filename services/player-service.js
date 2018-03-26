'use strict';

let Player = require('../models/player');
let handSetService = require('./hand-set-service');

function playerService() {

    function addAction(player, action) {
        handSetService.addAction(player.handSet, action);
    }

    function clearRound(player) {
        return handSetService.clearRound(player.handSet);
    }

    function create(id, name) {
        var handSet = handSetService.create();
        return new Player(id, name, handSet);
    }

    function dealCard(player, card) {
        handSetService.addCard(player.handSet, card);
    }

    function getCurrentHand(player) {
        return handSetService.getCurrentHand(player.handSet);
    }
    
    function hasUnplayedHand(player) {        
        return handSetService.hasUnplayedHand(player.handSet);
    }

    function startRound(player) {        
        return handSetService.startRound(player.handSet);
    }

    function stringify(player, active) {
        var actorName = player.name;
        if (active) {
            actorName = '<b>' + player.name + '</b>';
        }
        return actorName + ', ' + player.earningRate + handSetService.stringify(player.handSet, active);
    }

    function updateEarningRate(player) {
        var earningRate = handSetService.updateEarningRate(player.handSet);
        player.earningRate += earningRate;
    }

    return {
        addAction,
        clearRound,
        create,
        dealCard,
        getCurrentHand,
        hasUnplayedHand,
        startRound,
        stringify,
        updateEarningRate
    };
}

module.exports = playerService();
