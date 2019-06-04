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
        player: types.IPlayer = null;
        table: types.ITable = null;
        tableInterval: INullableValueReference<number> = { value: undefined };

        private created() {
            this.joinTable();
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
            services.tableService.deleteTable(this.table.id);
            Vue.set(this, 'table', undefined);
            services.playerService.deletePlayer(this.player.id);
            Vue.set(this, 'player', undefined);
            this.$emit('TableExited');
        }

        hit() {
            this.makeDecision(types.PlayerActions.Hit);
        }

        isUserPlayer(player?: types.IPlayer) {
            return true;
        }

        joinTable() {
            const table = services.tableService.createTable();
            const player = services.playerService.createPlayer('You');
            services.tableService.addPlayer(table, player);
            Vue.set(this, 'table', table);
            Vue.set(this, 'player', player);
            // TODO Create a subscribe method in tableService
            const interval = setInterval(() => {
                Vue.set(this, 'table', {...services.tableService.getTableById(this.table.id)});
            }, 1000);
            Vue.set(this, 'tableInterval', { value: interval });
        }

        makeDecision(decision: types.PlayerActions) {
            const result =
                useCases.makeDecision(this.table.id, this.player.id, decision);
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
            useCases.placeBet(this.table.id, this.player.id, 1);
        }
    }
</script>
