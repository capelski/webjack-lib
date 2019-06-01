<template>
    <Table
        v-if="renderCondition && table"
        :table="table"
        :actionsHandlers="actionsHandlers"
        :userPlayerId="player.id"
        :trainingProgress="-1"
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
            return {
                player: undefined,
                table: undefined
            };
        },
        created() {
            this.joinTable();
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
        watch: {
            renderCondition(newVal, oldVal) {
                if (newVal && !oldVal && !this.table) {
                    this.joinTable();
                }
            }
        },
        methods: {
            double() {
                this.makeDecision(types.PlayerActions.Double);
            },
            exitTable() {
                services.tableService.deleteTable(this.table.id);
                this.table = undefined;
                services.playerService.deletePlayer(this.player.id);
                this.player = undefined;
                this.$emit('TableExited');
            },
            hit() {
                this.makeDecision(types.PlayerActions.Hit);
            },
            isUserPlayer(player: models.Player) {
                return true;
            },
            joinTable() {
                this.table = services.tableService.createTable();
                this.player = services.playerService.createPlayer('You');
                services.tableService.addPlayer(this.table, this.player);
            },
            makeDecision(decision: types.PlayerActions) {
                const result =
                    useCases.makeDecision(this.table.id, this.player.id, decision);
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
                useCases.placeBet(this.table.id, this.player.id, 1);
            }
        }
    };
</script>
