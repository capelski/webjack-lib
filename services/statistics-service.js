'use strict';

let nodeUtils = require('../utils/node');
let js = require('../js-generics');
let scoreService = require('./score-service');

let ocurrencesMinium = 3;
let defaultOptimum = 2;

function statisticsService() {

    function addHandSetData(statistics, dealerHandSet, playerHandSet) {
        // The actions set must be iterated and register the previous score for each taken action and
        // check the final result to compute the earning rate (instead of the status)

        // [Hit, Hit, Stand]
        // 1) 9, A, Hit => 0
        // 2) 13, A, Hit => 0
        // 3) 17, A, Hit => 0

        // [Double]
        // 1) 10, 7, Double => 2

        // [Double]
        // 1) 11, A, Double => 0

        var dealerCards = dealerHandSet.hands[0].cards;
        var playerCards = playerHandSet.hands[0].cards;
        var playerInitialScore = scoreService.getEffectiveCardsScore(playerCards.slice(0, 2));
        var dealerInitialScore = scoreService.getEffectiveCardsScore(dealerCards.slice(0, 1));
        var decisionNode = getTargetNode(statistics.outcome,
            playerInitialScore, dealerInitialScore);

        decisionNode.playerInitialScore = playerInitialScore;
        decisionNode.dealerInitialScore = dealerInitialScore;
        decisionNode.dealerFinalScore = scoreService.getEffectiveCardsScore(dealerCards);

        iterateHandPhases(decisionNode, playerCards);
        updateDecisionNode(decisionNode);
    }

    function getOtpimumCardsNumber(statistics, playerInitialScore, dealerInitialScore) {
        var decisionNode = getTargetNode(statistics.outcome,
            playerInitialScore, dealerInitialScore);
        return decisionNode.optimumCardsNumber || defaultOptimum;
    }

    function getTargetNode(target, playerInitialScore, dealerInitialScore) {
        var parentNode = target[playerInitialScore] = target[playerInitialScore] || [];
        var childNode = parentNode[dealerInitialScore] = parentNode[dealerInitialScore] || [];
        return childNode;
    }

    function iterateStatistics(statistics, functionExpression) {
        js.iterate(statistics.outcome, (initialScoreNode) => {
            if (initialScoreNode) {
                js.iterate(initialScoreNode, (decisionNode) => {
                    if (decisionNode) {
                        functionExpression(decisionNode);
                    }                    
                });
            }            
        });
    }

    function iterateHandPhases(decisionNode, playerCards) {
        for (var i = 2; i <= 10; ++i) {
            var phaseScore = scoreService.getEffectiveCardsScore(playerCards.slice(0, i));
            var status;
            if (phaseScore > 21) {
                status = 'loses';
            }
            else if (phaseScore === 21 && i === 2) {
                status = 'blackJack';
            }
            else if (decisionNode.dealerFinalScore > 21) {
                status = 'wins';
            }
            else if (phaseScore === decisionNode.dealerFinalScore) {
                status = 'ties';
            }
            else {
                status = phaseScore > decisionNode.dealerFinalScore ? 'wins' : 'loses';
            }

            decisionNode.possibilities = decisionNode.possibilities || [];
            decisionNode.possibilities[i] = decisionNode.possibilities[i] || {
                odds: {},
                results: {},
                returningRate: 0,
                history: []
            };
            decisionNode.possibilities[i].history.push(status);
        }
    }

    function stringify(statistics, includeReturningRate) {
        var stringifiedTree = '<table><tr>' + 
        '<td>Player score</td><td>Dealer\'s 2</td><td>Dealer\'s 3</td><td>Dealer\'s 4</td>' +
        '<td>Dealer\'s 5</td><td>Dealer\'s 6</td><td>Dealer\'s 7</td><td>Dealer\'s 8</td>' +
        '<td>Dealer\'s 9</td><td>Dealer\'s 10</td><td>Dealer\'s A</td><td>Returning rate</td>' +
        '</tr>';
        js.iterate(statistics.outcome, (initialScoreNode, key) => {            
            stringifiedTree += '<tr><td>' + key + '</td>';
            var returningRate = 0,
            count = 0;
            if (initialScoreNode) {
                js.iterate(initialScoreNode, (decisionNode) => {
                    if (decisionNode && decisionNode.optimumCardsNumber) {
                        ++count;
                        returningRate += decisionNode.returningRate;
                        var stringifiedNode = decisionNode.optimumCardsNumber;
                        if (includeReturningRate) {
                            stringifiedNode += ' - <i>' + decisionNode.returningRate + '</i>';
                        }                        
                        if (decisionNode.returningRate >= 1) {
                            stringifiedNode = '<b>' + stringifiedNode + '</b>';
                        }
                        stringifiedNode = '<td>' + stringifiedNode + '</td>';
                        stringifiedTree += stringifiedNode;
                    } else {
                        stringifiedTree += '<td>?</td>';
                    }
                });
            }
            if (count > 0) {
                returningRate = Math.round(returningRate * 100 / count) / 100;
            }                
            stringifiedTree += '<td>' + (returningRate || '?') + '</td>';
            stringifiedTree += '</tr>';
        });
        stringifiedTree += '</table>';

        return stringifiedTree;
    }

    function storeHandData(actor, dealer) {
        return addHandSetData(actor.statistics, dealer.handSet, actor.handSet);
    }

    function stringifyHistorical(decisionNode) {
        var stringifiedHistorical = '';
        js.iterate(decisionNode.possibilities, (possibility, key) => {
            stringifiedHistorical += 'Historical for ' + key + ' cards: ';
            js.iterate(possibility.history, (ocurrence) => {
               stringifiedHistorical += ocurrence + ', ';
            });
            stringifiedHistorical += '<br \>';
        });
        return stringifiedHistorical;
    }

    function stringifyOdds(decisionNode) {
        var stringifiedOdds = '';
        js.iterate(decisionNode.possibilities, (possibility, key) => {
            stringifiedOdds += 'Odds for ' + key + ' cards: ';
            js.iterate(possibility.odds, (odd, key) => {
               stringifiedOdds += key + ': ' + odd + '%, ';
            });
            stringifiedOdds += '(' + possibility.history.length + ' simulations) <br \>';
        });
        return stringifiedOdds;
    }

    function stringifyOutlayers(statistics, includeHistorical) {
        var stringifiedOutlayers = '';
        iterateStatistics(statistics, (decisionNode) => {
            if (decisionNode.optimumCardsNumber && decisionNode.optimumCardsNumber > 3) {
                stringifiedOutlayers +=
                'Player initial score: ' + decisionNode.playerInitialScore +
                ', dealer initial score: ' + decisionNode.dealerInitialScore + 
                ', optimum cards number: ' + (decisionNode.optimumCardsNumber || '?') +
                '<br />';

                stringifiedOutlayers += stringifyOdds(decisionNode);
                if (includeHistorical) {
                    stringifiedOutlayers += stringifyHistorical(decisionNode);
                }
            }
        });
        return stringifiedOutlayers;
    }

    function updateDecisionNode(decisionNode) {
        js.iterateFor(decisionNode.possibilities, (possibility, index) => {
            if (possibility) {
                updatePossibility(possibility);
            }
        });

        decisionNode.returningRate = 0;
        js.iterateFor(decisionNode.possibilities, (possibility, index) => {
            if (possibility && possibility.history.length >= ocurrencesMinium &&
            possibility.returningRate > decisionNode.returningRate) {
                decisionNode.returningRate = possibility.returningRate;
                decisionNode.optimumCardsNumber = index;
            }
        });
    }

    function updateDecisions(statistics) {
        iterateStatistics(statistics, (decisionNode) => {               
            updateDecisionNode(decisionNode);
        });
    }

    function updatePossibility(possibility) {
        possibility.results = {
            blackjack: 0,
            loses: 0,
            ties: 0,
            wins: 0
        };

        js.iterateFor(possibility.history, (ocurrence) => {
            possibility.results[ocurrence]++;
        });

        var percentizedValues = js.percentizeValues(possibility.results.blackjack, 
        possibility.results.loses, possibility.results.ties, possibility.results.wins);

        possibility.odds = {
            blackjack: percentizedValues[0],
            loses: percentizedValues[1],
            ties: percentizedValues[2],
            wins: percentizedValues[3]
        };
        // possibility.returningRate = getEarningRate(possibility.odds);
    }

    return {
        addHandSetData: nodeUtils.trace(statisticsService.name, addHandSetData),
        getOtpimumCardsNumber: nodeUtils.trace(statisticsService.name, getOtpimumCardsNumber),
        storeHandData: nodeUtils.trace(statisticsService.name, storeHandData),
        stringify: nodeUtils.trace(statisticsService.name, stringify),
        stringifyOutlayers: nodeUtils.trace(statisticsService.name, stringifyOutlayers),
        updateDecisions: nodeUtils.trace(statisticsService.name, updateDecisions)
    };
}

module.exports = statisticsService();
