<template>
    <Table
        v-if="renderCondition && table"
        :actionsHandlers="actionsHandlers"
        :isUserPlayerHandler="() => true"
        :startRoundButtonText="'Place bet'"
        :table="table"
        :userPlayerId="userPlayer.id"
    >
        <span>
            <button
                class="btn optimal-decision"
                v-on:click="displayOptimalDecision"
            >
                &#9873;
            </button>
        </span>
    </Table>
</template>

<script lang="ts">
    import toastr from 'toastr';
    import Vue from 'vue';
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import { services, types, useCases, utils } from 'webjack-core';
    import { IActionsBarHandlers, INullableValueReference } from '../utils/types';
    import Table from './Table.vue';

    @Component({
        components: {
            Table
        }
    })
    export default class LocalTable extends Vue {
        @Prop({ default: true })
        renderCondition: boolean;

        @Watch('renderCondition')
        renderConditionChanged(newValue: boolean, oldValue: boolean) {
            if (newValue && !oldValue && !this.table) {
                this.joinTable();
            }
        }

        actionsHandlers: IActionsBarHandlers = {
            exitTable: this.exitTable,
            startRound: this.startRound,
            double: this.double,
            hit: this.hit,
            split: this.split,
            stand: this.stand
        };
        table: types.ITable = null;
        unsubscriber: INullableValueReference<() => void> = { value: undefined };
        userPlayer: types.IPlayer = null;

        private created() {
            this.joinTable();
        }

        get dealerScore() {
            let dealerScore;
            const dealerHand = services.playerService.getCurrentHand(this.table.dealer);
            if (dealerHand) {
                dealerScore = services.handService.getValue(dealerHand);
            }
            return dealerScore;
        }

        displayOptimalDecision() {
            const hand = services.playerService.getCurrentHand(this.userPlayer);
            const optimalDecisionInfo = utils.basicStrategy.getOptimalDecision(hand!, this.dealerScore!).description;
            toastr.info(optimalDecisionInfo, 'Basic strategy');
        }

        double() {
            this.makeDecision(types.PlayerActions.Double);
        }

        exitTable() {
            if (this.unsubscriber.value) {
                this.unsubscriber.value();
            }
            Vue.set(this, 'unsubscriber', { value: undefined });
            services.tableService.deleteTable(this.table.id);
            Vue.set(this, 'table', undefined);
            services.playerService.deletePlayer(this.userPlayer.id);
            Vue.set(this, 'userPlayer', undefined);
            this.$emit('TableExited');
        }

        hit() {
            this.makeDecision(types.PlayerActions.Hit);
        }

        joinTable() {
            const table = services.tableService.createTable();
            const userPlayer = services.playerService.createPlayer('You');
            services.tableService.addPlayer(table, userPlayer);
            Vue.set(this, 'table', table);
            Vue.set(this, 'userPlayer', userPlayer);
            const unsubscriber = services.tableService.subscribe(table.id, (table) => {
                Vue.set(this, 'table', { ...table });
            })
            Vue.set(this, 'unsubscriber', { value: unsubscriber });
        }

        makeDecision(decision: types.PlayerActions) {
            const result =
                useCases.makeDecision(this.table.id, this.userPlayer.id, decision);
            if (result.outcome === types.IOperationOutcome.error) {
                toastr.error(result.error);
            }
        }

        split() {
            this.makeDecision(types.PlayerActions.Split);
        }

        stand() {
            this.makeDecision(types.PlayerActions.Stand);
        }

        startRound() {
            useCases.placeBet(this.table.id, this.userPlayer.id, 1);
        }
    }
</script>
