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
            :table="table"
            :actionsHandlers="actionsHandlers"
            :userPlayerId="userPlayerId.value"
            :trainingProgress="-1"
            :isUserPlayerHandler="isUserPlayer"
            :evaluteDecisions="false"
            :displayDecisionHelp="false"
            :startRoundButtonText="'Place bet'"
        />
    </div>
</template>

<script lang="ts">
    import toastr from 'toastr';
    import Vue from 'vue';
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import { types } from 'webjack-core';
    import { WebsocketRequestMessage, WebsocketRequestType, WebsocketResponseMessage, WebsocketResponseType } from 'webjack-websocket-contracts';
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
    export default class WebsocketTable extends Vue {
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
        websocketUrl: string;

        actionsHandlers: IActionsBarHandlers = {
            exitTable: this.tableExit,
            startRound: this.startRound,
            double: this.double,
            hit: this.hit,
            split: this.split,
            stand: this.stand
        };
        loading: IValueReference<boolean> = { value: false };
        table: types.ITable = null;
        userPlayerId: INullableValueReference<string> = { value: undefined };
        webSocket: WebSocket;

        private created() {
            this.setLoading(true);
            this.openWebSocket().then(_ => {
                this.sendMessage({
                    operationType: WebsocketRequestType.clientData
                });
            });
        }

        cancelRegister() {
            this.$emit('TableExited');
        }

        clientDataResponse(playerId?: string, table?: types.ITable) {
            Vue.set(this, 'userPlayerId', { value: playerId });
            if (table) {
                Vue.set(this, 'table', table);
                this.setLoading(false);
            }
            else if (playerId && this.renderCondition) {
                this.joinTable();
            }
            else {
                this.setLoading(false);
            }
        }

        double() {
            this.makeDecision(types.PlayerActions.Double);
        }

        exitTable() {
            Vue.set(this, 'table', undefined);
            this.$emit('TableExited');
        }

        hit() {
            this.makeDecision(types.PlayerActions.Hit);
        }

        isUserPlayer(player?: types.IPlayer) {
            return player && player.id === this.userPlayerId.value;
        }

        joinTable() {
            this.sendMessage({
                operationType: WebsocketRequestType.joinTable
            });
        }

        joinTableResponse(error?: string, table?: types.ITable) {
            if (error) {
                this.exitTable();
            }
            else {
                Vue.set(this, 'table', table);
                this.$emit('TableJoined');
            }
            this.setLoading(false);
        }

        makeDecision(decision: types.PlayerActions) {
            this.sendMessage({
                operationType: WebsocketRequestType.makeDecision,
                decision
            });
        }

        openWebSocket() {
            return new Promise(resolve => {
                this.webSocket = new WebSocket(this.websocketUrl);
                this.webSocket.onopen = () => {
                    this.webSocket.onmessage = (message) => {
                        let data = JSON.parse(message.data) as WebsocketResponseMessage;
                        if ('error' in data) {
                            toastr.error(data.error, 'Validation error');
                        }
                        switch (data.operationType) {
                            case WebsocketResponseType.clientData:
                                this.clientDataResponse(data.playerId, data.table);
                                break;
                            case WebsocketResponseType.exitTable:
                                this.tableExitResponse(data.error);
                                break;
                            case WebsocketResponseType.inactivityKickOut:
                                Vue.set(this, 'userPlayerId', { value: undefined });
                                this.exitTable();
                                this.webSocket = null;
                                break;
                            case WebsocketResponseType.joinTable:
                                this.joinTableResponse(data.error, data.table);
                                break;
                            case WebsocketResponseType.registerPlayer:
                                this.registerPlayerResponse(data.error, data.playerId);
                                break;
                            case WebsocketResponseType.tableUpdate:
                                Vue.set(this, 'table', data.table);
                                break;
                            default:
                                break;
                        }
                    };
                    resolve();
                };
            });
        }

        registerPlayer(name: string) {
            this.setLoading(true);
            let webSocketPromise = Promise.resolve({});
            if (!this.webSocket) {
                webSocketPromise = this.openWebSocket();
            }
            webSocketPromise.then(_ => {
                this.sendMessage({
                    operationType: WebsocketRequestType.registerPlayer,
                    name
                });
            });
        }

        registerPlayerResponse(error?: string, playerId?: string) {
            if (error) {
                this.setLoading(false);
            }
            else {
                Vue.set(this, 'userPlayerId', { value: playerId });
                this.joinTable();
            }
        }

        sendMessage(message: WebsocketRequestMessage) {
            this.webSocket.send(JSON.stringify(message));
        }

        split() {
            this.makeDecision(types.PlayerActions.Split);
        }

        setLoading(value: boolean) {
            Vue.set(this, 'loading', { value });
            this.$emit(value ? 'LoadingStarted' : 'LoadingFinished');
        }

        stand() {
            this.makeDecision(types.PlayerActions.Stand);
        }

        startRound() {
            this.sendMessage({
                operationType: WebsocketRequestType.placeBet,
                bet: 1
            });
        }

        tableExit() {
            this.setLoading(true);
            this.sendMessage({
                operationType: WebsocketRequestType.exitTable
            })
        }

        tableExitResponse(error?: string) {
            if (!error) {
                this.exitTable();
            }
            this.setLoading(false);
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