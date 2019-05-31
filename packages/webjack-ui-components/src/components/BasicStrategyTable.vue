<template>
    <Table
        v-if="renderCondition"
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
            const table = services.tableService.createTable();
            table.players = ' '.repeat(7).split('')
                .map((_, index) => services.playerService.createRobot(`Robot ${index + 1}`));

            return {
                table: table,
                randomState: services.randomHandsService.getRandomInitialState()
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
            userPlayerId(): models.Player | undefined {
                return (services.tableService.getCurrentPlayer(this.table) || this.table.players[0]).id;
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
                services.tableService.setIsRoundBeingPlayed(this.table, true);

                const randomHandsSet = services.randomHandsService.getRandomHandsSet(this.randomState, this.table.players.length, this.table.cardSet);

                this.table.players.forEach((player, index) => {
                    const randomHand = randomHandsSet.playersHand[index];
                    services.playerService.setHands(player, [randomHand]);
                    services.playerService.increaseEarningRate(player, -1);
                });

                const dealerHand = services.handService.create(0);
                services.playerService.setHands(this.table.dealer, [randomHandsSet.dealerHand]);

                useCases.moveRoundForward(this.table);
            }
        }
    };
</script>
