<template>
    <Table
        v-if="renderCondition && table"
        :table="table"
        :actionsHandlers="actionsHandlers"
        :userPlayerId="userPlayerId"
        :basicStrategyProgress="randomState.progress"
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
            return {
                table: undefined,
                randomState: undefined
            };
        },
        created() {
            this.table = services.tableService.createTable();
            ' '.repeat(7)
                .split('')
                .forEach((_, index) => {
                    const player = services.playerService.createPlayer(`Robot ${index + 1}`);
                    services.tableService.addPlayer(this.table, player);
                });
            this.randomState = services.randomHandsService.getRandomInitialState();
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
                const randomHandsSet = services.randomHandsService.getRandomHandsSet(this.randomState, this.table.players.length, this.table.cardSet);

                this.table.players.forEach((player, index) => {
                    const randomHand = randomHandsSet.playersHand[index];
                    services.playerService.setHands(player, [randomHand]);
                    services.playerService.updateEarningRate(player, -1);
                });

                const dealerHand = services.handService.create(0);
                services.playerService.setHands(this.table.dealer, [randomHandsSet.dealerHand]);
                services.tableService.setStatus(this.table, types.TableStatus.PlayerTurns);

                useCases.updateCurrentRound(this.table);
            }
        }
    };
</script>
