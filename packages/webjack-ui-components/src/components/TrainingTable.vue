<template>
    <Table
        v-if="renderCondition && table"
        :table="table"
        :actionsHandlers="actionsHandlers"
        :userPlayerId="userPlayerId"
        :trainingProgress="table.cardSet.trainingSet.progress"
        :isUserPlayerHandler="() => true"
        :evaluteDecisions="true"
        :displayDecisionHelp="false"
        :startRoundButtonText="'Start round'"
    />
</template>

<script lang="ts">
    import toastr from 'toastr';
    import { models, services, types, useCases } from 'webjack-core';
    import Table from './Table.vue';
    import { ActionsBarHandlers } from '../utils/handlers-types';

    export default {
        name: 'TrainingTable',
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
                table: undefined,
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
            },
            userPlayerId(): models.Player | undefined {
                return (services.tableService.getCurrentPlayer(this.table) || this.table.players[0]).id;
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
                this.table.players.forEach(services.playerService.deletePlayer);
                services.tableService.deleteTable(this.table.id);
                this.table = undefined;
                this.$emit('TableExited');
            },
            hit() {
                this.makeDecision(types.PlayerActions.Hit);
            },
            joinTable() {
                this.table = services.tableService.createTable(true);
                ' '.repeat(7)
                    .split('')
                    .forEach((_, index) => {
                        const player = services.playerService.createPlayer(`Robot ${index + 1}`);
                        services.tableService.addPlayer(this.table, player);
                    });
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
                this.table.players.reduce((promiseChain, player) => {
                    return promiseChain.then(_ =>  {
                        useCases.placeBet(this.table.id, player.id, 1);
                        return new Promise(resolve => setTimeout(resolve, 800));
                    })
                }, Promise.resolve({}));
            }
        }
    };
</script>
