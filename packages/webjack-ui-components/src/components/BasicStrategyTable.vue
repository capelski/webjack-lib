<template>
    <Table
        :table="table"
        :actionsHandlers="actionsHandlers"
        :userPlayer="userPlayer"
        :basicStrategyProgress="randomState.progress"
        :isUserPlayerHandler="() => true"
        :evaluteDecisions="true"
        :displayDecisionHelp="false"
        :startRoundButtonText="'Start round'"
    />
</template>

<script lang="ts">
    import Table from './Table.vue';
    import { Player, Table as TableModel, tableService, orchestrationService, playerService, handService, randomHandsService, PlayerActions } from 'webjack-core';
    import { ActionsBarHandlers } from '../utils/handlers-types';

    declare const toastr: any;

    export default {
        name: 'BasicStrategyTable',
        components: {
            Table
        },
        data() {
            const table = tableService.createTable();
            table.players = ' '.repeat(7).split('')
                .map((_, index) => playerService.createRobot(`Robot ${index + 1}`));

            return {
                table: table,
                randomState: randomHandsService.getRandomInitialState()
            };
        },
        computed: {
            actionsHandlers() {
                return {
                    exitTable: this.exitTable,
                    startRound: this.startRound,
                    double: this.double,
                    hit: this.hit,
                    split: this.split,
                    stand: this.stand
                } as ActionsBarHandlers;
            },
            currentPlayerId() {
                const currentPlayer = tableService.getCurrentPlayer(this.table);
                return currentPlayer ? currentPlayer.id : undefined;
            },
            userPlayer(): Player | undefined {
                return this.table.players.find(p => p.id === this.currentPlayerId);
            }
        },
        methods: {
            double() {
                this.makeDecision(PlayerActions.Double);
            },
            exitTable() {
                tableService.deleteTable(this.table.id);
                this.$emit('TableExited');
            },
            hit() {
                this.makeDecision(PlayerActions.Hit);
            },
            makeDecision(decision: PlayerActions) {
                try {
                    orchestrationService.makeDecision(this.table, this.userPlayer!.id, decision);
                }
                catch(exception) {
                    toastr.error(exception);
                }
            },
            split() {
                this.makeDecision(PlayerActions.Split);
            },
            stand() {
                this.makeDecision(PlayerActions.Stand);
            },
            startRound() {
                const bet = 1;
                tableService.setIsRoundBeingPlayed(this.table, true);

                const randomHandsSet = randomHandsService.getRandomHandsSet(this.randomState, this.table.players.length, this.table.cardSet);

                this.table.players.forEach((player, index) => {
                    const randomHand = randomHandsSet.playersHand[index];
                    playerService.setHands(player, [randomHand]);
                    playerService.increaseEarningRate(player, -1);
                });

                const dealer = tableService.getDealer(this.table);
                const dealerHand = handService.create(0);
                playerService.setHands(dealer, [randomHandsSet.dealerHand]);

                orchestrationService.moveRoundForward(this.table);
            }
        }
    };
</script>

<style>
    .black-jack-table {
        display: flex;
        flex-direction: column;
        height: calc(100% - 89px);
        overflow: hidden;
    }

    .table-dealer {
        margin-top: 20px;
    }
    @media(min-width: 992px) {
        .table-dealer {
            width: 300px;
            margin: 0 auto;
            margin-top: 20px;
            text-align: center;
        }
    }

    .table-players {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        overflow-y: auto;
        overflow-x: hidden;
    }
    
    @media(min-width: 992px) {
        .table-players {
            margin-top: 0;
            flex-direction: row;
        }
    }
</style>