<template>
    <Table
        v-if="renderCondition"
        :table="table"
        :actionsHandlers="actionsHandlers"
        :userPlayerId="userPlayerId"
        :basicStrategyProgress="-1"
        :isUserPlayerHandler="isUserPlayer"
        :evaluteDecisions="false"
        :displayDecisionHelp="true"
        :startRoundButtonText="'Place bet'"
    />
</template>

<script lang="ts">
    import toastr from 'toastr';
    import { models, services, types, useCases } from 'webjack-core';
    import Table from './Table.vue';
    import { ActionsBarHandlers } from '../utils/handlers-types';

    export default {
        name: 'LocalTable',
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
            const player = services.playerService.createRobot('You');
            const table = services.tableService.createTable();
            services.tableService.addPlayer(table, player);

            return {
                userPlayerId: player.id,
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
            }
        },
        methods: {
            double() {
                this.makeDecision(types.PlayerActions.Double);
            },
            exitTable() {
                services.tableService.deleteTable(this.table.id);
                this.$emit('TableExited');
            },
            hit() {
                this.makeDecision(types.PlayerActions.Hit);
            },
            isUserPlayer(player: models.Player) {
                return true;
            },
            makeDecision(decision: types.PlayerActions) {
                const result =
                    useCases.makeDecision(this.table.id, this.userPlayerId, decision);
                if (!result.ok) {
                    toastr.error(result.error);
                }
            },
            split() {
                this.makeDecision(types.PlayerActions.Split);
            },
            stand() {
                this.makeDecision(types.PlayerActions.Stand);
            },
            startRound() {
                useCases.placeBet(this.table.id, this.userPlayerId, 1);
            }
        }
    };
</script>
