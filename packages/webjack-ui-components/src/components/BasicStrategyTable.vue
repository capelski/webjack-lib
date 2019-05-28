<template>
    <Table
        v-if="renderCondition"
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
    import toastr from 'toastr';
    import {
        Player,
        Table as TableModel,
        tableService,
        playerService,
        handService,
        randomHandsService,
        PlayerActions
    } from 'webjack-core';
    import Table from './Table.vue';
    import { ActionsBarHandlers } from '../utils/handlers-types';

    export default {
        name: 'BasicStrategyTable',
        components: {
            Table
        },
        props: {
            renderCondition: {
                type: Boolean,
                default: true
            }
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
                    tableService.makeDecision(this.table, this.userPlayer!.id, decision);
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
                tableService.setIsRoundBeingPlayed(this.table, true);

                const randomHandsSet = randomHandsService.getRandomHandsSet(this.randomState, this.table.players.length, this.table.cardSet);

                this.table.players.forEach((player, index) => {
                    const randomHand = randomHandsSet.playersHand[index];
                    playerService.setHands(player, [randomHand]);
                    playerService.increaseEarningRate(player, -1);
                });

                const dealerHand = handService.create(0);
                playerService.setHands(this.table.dealer, [randomHandsSet.dealerHand]);

                tableService.moveRoundForward(this.table);
            }
        }
    };
</script>
