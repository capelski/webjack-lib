<template>
    <div class="full-height" v-if="renderCondition || loading.value">
        <Loader v-if="loading.value"/>
        <RemoteRegister 
            v-if="renderCondition && !loading.value && !userPlayerId.value"
            v-on:RegisterCanceled="cancelRegister"
            v-on:RegisterRequested="registerPlayer"
        />
        <Table
            v-if="renderCondition && !loading.value && userPlayerId.value && table"
            :actionsHandlers="actionsHandlers"
            :isUserPlayerHandler="isUserPlayer"
            :startRoundButtonText="'Place bet'"
            :table="table"
            :userPlayerId="userPlayerId.value"
        />
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import { types } from 'webjack-core';
    import { get } from '../utils/http';
    import { stallPromise } from '../utils/shared';
    import { IActionsBarHandlers, IValueReference, INullableValueReference } from '../utils/types';
    import Loader from './Loader.vue';
    import RemoteRegister from './RemoteRegister.vue';
    import Table from './Table.vue';

    @Component({
        components: {
            Loader,
            RemoteRegister,
            Table
        }
    })
    export default class AjaxTable extends Vue {
        @Prop({ default: true })
        renderCondition: boolean;

        @Watch('renderCondition')
        renderConditionChanged(newValue: boolean, oldValue: boolean) {
            if (newValue && !oldValue && this.userPlayerId.value && !this.table) {
                this.setLoading(true);
                this.joinTable();
            }
        }

        @Prop({ required: true })
        serverUrl: string;

        actionsHandlers: IActionsBarHandlers = {
            exitTable: this.requestTableExit,
            startRound: this.startRound,
            double: this.double,
            hit: this.hit,
            split: this.split,
            stand: this.stand
        };
        loading: IValueReference<boolean> = { value: false };
        table: types.ITable = null;
        tableInterval: INullableValueReference<number> = { value: undefined };
        userPlayerId: INullableValueReference<string> = { value: undefined };

        private created() {
            this.setLoading(true);
            stallPromise(get(this.serverUrl, 'session-data', 'Error checking whether the player is already registered'))
                .then(data => {
                    Vue.set(this, 'userPlayerId', { value: data.playerId });
                    if (data.tableId) {
                        this.setUpdateInterval();
                    }
                    else if (data.playerId && this.renderCondition) {
                        this.joinTable();
                    }
                    else {
                        this.setLoading(false);
                    }
                })
                .catch(_ => this.setLoading(false));
        }

        cancelRegister() {
            this.$emit('TableExited');
        }

        double() {
            this.makeDecision(types.PlayerActions.Double);
        }

        requestTableExit() {
            this.setLoading(true);
            return stallPromise(get(this.serverUrl, 'exit-table'))
                .then(() => {
                    this.exitTable();
                    this.setLoading(false);
                })
                .catch(_ => this.setLoading(false));
        }

        exitTable() {
            Vue.set(this, 'table', undefined);
            if (this.tableInterval.value) {
                clearInterval(this.tableInterval.value);
            }
            Vue.set(this, 'tableInterval', { value: undefined });
            this.$emit('TableExited');
        }

        hit() {
            this.makeDecision(types.PlayerActions.Hit);
        }

        isUserPlayer(player?: types.IPlayer) {
            return player && player.id === this.userPlayerId.value;
        }

        joinTable() {
            stallPromise(get(this.serverUrl, 'join-table', 'Error trying to join a table'))
                .then(data => {
                    this.setUpdateInterval();
                })
                .catch(_ => {
                    this.exitTable();
                    this.setLoading(false);
                });
        }

        makeDecision(decision: types.PlayerActions) {
            get(this.serverUrl, 'make-decision', `Error on ${decision}`, { decision })
        }

        registerPlayer(name: string) {
            this.setLoading(true);
            return stallPromise(get(this.serverUrl, 'register-player','Error registering the player', { name }))
                .then(data => {
                    Vue.set(this, 'userPlayerId', { value: data.playerId });
                    this.joinTable();
                })
                .catch(_ => this.setLoading(false));
        }

        split() {
            this.makeDecision(types.PlayerActions.Split);
        }

        setLoading(value: boolean) {
            Vue.set(this, 'loading', { value });
            this.$emit(value ? 'LoadingStarted' : 'LoadingFinished');
        }
        
        setUpdateInterval() {
            const updateTableInterval = () =>
                get(this.serverUrl, 'table-status', 'Error getting the table status')
                    .then(responseData => Vue.set(this, 'table', responseData))
                    .catch(_ => this.exitTable());
            const interval = window.setInterval(updateTableInterval, 1000);
            Vue.set(this, 'tableInterval', { value: interval });
            this.$emit('TableJoined');
            return updateTableInterval().then(_ => this.setLoading(false));
        }

        stand() {
            this.makeDecision(types.PlayerActions.Stand);
        }

        startRound() {
            get(this.serverUrl, 'place-bet', 'Error placing the bet', { bet: 1 });
        }
    }
</script>

<style>
    .full-height {
        height: 100%;
    }

    .top-space-20 {
        margin-top: 20px;
    }
</style>