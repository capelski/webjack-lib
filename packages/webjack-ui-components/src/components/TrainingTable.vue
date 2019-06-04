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
    import Vue from 'vue';
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import { services, types, useCases } from 'webjack-core';
    import { IActionsBarHandlers, INullableValueReference } from '../utils/types';
    import Table from './Table.vue';

    @Component({
        components: {
            Table
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
        tableInterval: INullableValueReference<number> = { value: undefined };

        private created() {
            this.joinTable();
        }

        get userPlayerId(): string | undefined {
            return (services.tableService.getCurrentPlayer(this.table) || this.table.players[0]).id;
        }

        double() {
            this.makeDecision(types.PlayerActions.Double);
        }
        
        exitTable() {
            // TODO Create an unsubscribe method in tableService
            if (this.tableInterval.value) {
                clearInterval(this.tableInterval.value);
            }
            Vue.set(this, 'tableInterval', { value: undefined });
            this.table.players.forEach(player => services.playerService.deletePlayer(player.id));
            services.tableService.deleteTable(this.table.id);
            Vue.set(this, 'table', undefined);
            this.$emit('TableExited');
        }

        hit() {
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
            // TODO Create a subscribe method in tableService
            const interval = setInterval(() => {
                Vue.set(this, 'table', {...services.tableService.getTableById(this.table.id)});
            }, 1000);
            Vue.set(this, 'tableInterval', { value: interval });
        }

        makeDecision(decision: types.PlayerActions) {
            const result =
                useCases.makeDecision(this.table.id, this.userPlayerId, decision);
            if (!result.ok) {
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
            this.table.players.reduce((promiseChain, player) => {
                return promiseChain.then(_ =>  {
                    useCases.placeBet(this.table.id, player.id, 1);
                    return new Promise(resolve => window.setTimeout(resolve, 800));
                })
            }, Promise.resolve({}));
        }
    }
</script>
