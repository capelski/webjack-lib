<template>
    <Table
        v-if="renderCondition"
        :table="table"
        :actionsHandlers="actionsHandlers"
        :userPlayer="userPlayer"
        :basicStrategyProgress="-1"
        :isUserPlayerHandler="isUserPlayer"
        :evaluteDecisions="false"
        :displayDecisionHelp="true"
        :startRoundButtonText="'Place bet'"
    />
</template>

<script lang="ts">
    import Table from './Table.vue';
    import { Player, Table as TableModel, playerService, tableService, orchestrationService, PlayerActions } from 'webjack-core';
    import { ActionsBarHandlers } from '../utils/handlers-types';

    declare const toastr: any;

    export default {
        name: 'LocalTable',
        components: {
            Table
        },
        props: {
            renderCondition: {
                type: Boolean,
                required: true
            }
        },
        data() {
            const player = playerService.createRobot('You');
            const table = tableService.createTable();
            table.players = [player];

            return {
                table
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
            userPlayer(): Player | undefined {
                // TODO Define a offlineUserId in the state and use tableService.getById
                return this.table.players.find(p => p.name === 'You');
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
            isUserPlayer(player: Player) {
                // TODO Only one player for now. We should be able to add robots
                return true;
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
                orchestrationService.placeBet(this.table, this.userPlayer!.id, bet);
            }
        }
    };
</script>
