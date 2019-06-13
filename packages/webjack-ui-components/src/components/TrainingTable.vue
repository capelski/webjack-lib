<template>
    <Table
        v-if="renderCondition && table"
        :actionsHandlers="actionsHandlers"
        :isUserPlayerHandler="() => true"
        :startRoundButtonText="'Start round'"
        :table="table"
        :userPlayerId="userPlayer.id"
    >
        <span>
            <ShakyElement
                :class="{'training-progress': true }"
                :html="(trainingProgress !== -1 ? trainingProgress : 0) + ' &#10227;'"
                :displayInline="true"
            />
            <ShakyElement
                :class="{'training-counter': true }"
                :html="trainingPercentage + '%'"
                :displayInline="true"
            />
        </span>
    </Table>
</template>

<script lang="ts">
    import toastr from 'toastr';
    import Vue from 'vue';
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import { services, types, useCases, utils } from 'webjack-core';
    import { IActionsBarHandlers, INullableValueReference, IValueReference } from '../utils/types';
    import ShakyElement from './ShakyElement.vue';
    import Table from './Table.vue';

    @Component({
        components: {
            Table,
            ShakyElement
        }
    })
    export default class TrainingTable extends Vue {
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
        table: types.ITable | null = null;
        trainingAttempts: IValueReference<number> = { value: 0 };
        trainingHits: IValueReference<number> = { value: 0 };
        unsubscriber: INullableValueReference<() => void> = { value: undefined };

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

        double() {
            this.evaluatePlayerDecision(types.PlayerActions.Double);
            this.makeDecision(types.PlayerActions.Double);
        }

        evaluatePlayerDecision(userDecision: types.PlayerActions) {
            const hand = services.playerService.getCurrentHand(this.userPlayer);
            const optimalDecision = utils.basicStrategy.getOptimalDecision(hand!, this.dealerScore!);
            Vue.set(this, 'trainingAttempts', { value: this.trainingAttempts.value + 1 });
            if (optimalDecision.action === userDecision) {
                Vue.set(this, 'trainingHits', { value: this.trainingHits.value + 1 });
            }
            else {
                toastr.error(`Wrong! ${optimalDecision.description}`, 'Basic strategy');
            }
        }
        
        exitTable() {
            if (this.unsubscriber.value) {
                this.unsubscriber.value();
            }
            Vue.set(this, 'unsubscriber', { value: undefined });
            this.table.players.forEach(player => services.playerService.deletePlayer(player.id));
            services.tableService.deleteTable(this.table.id);
            Vue.set(this, 'table', undefined);
            this.$emit('TableExited');
        }

        hit() {
            this.evaluatePlayerDecision(types.PlayerActions.Hit);
            this.makeDecision(types.PlayerActions.Hit);
        }

        joinTable() {
            const table = services.tableService.createTable(true);
            ' '.repeat(7)
                .split('')
                .forEach((_, index) => {
                    const player = services.playerService.createPlayer(`Robot ${index + 1}`);
                    services.tableService.addPlayer(table, player);
                });
            Vue.set(this, 'table', table);
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
            this.evaluatePlayerDecision(types.PlayerActions.Split);
            this.makeDecision(types.PlayerActions.Split);
        }

        stand() {
            this.evaluatePlayerDecision(types.PlayerActions.Stand);
            this.makeDecision(types.PlayerActions.Stand);
        }

        startRound() {
            this.table.players.reduce((promiseChain, player) => {
                return promiseChain.then(_ =>  {
                    useCases.placeBet(this.table.id, player.id, 1);
                    return new Promise(resolve => window.setTimeout(resolve, 800));
                })
            }, Promise.resolve({}));
        }

        get trainingPercentage() {
            return this.trainingAttempts.value ?
                Math.floor(this.trainingHits.value * 1000 / this.trainingAttempts.value) / 10 : 0;
        }

        get trainingProgress() {
            return this.table.cardSet.trainingSet.progress;
        }

        get userPlayer() {
            return services.tableService.getCurrentPlayer(this.table) || this.table.players[0];
        }
    }
</script>
