<template>
    <div class="full-height" v-if="renderCondition || loading">
        <Loader v-if="loading"/>
        <RemoteRegister 
            v-if="renderCondition && !loading && !isPlayerRegistered"
            v-on:RegisterCanceled="cancelRegister"
            v-on:RegisterRequested="registerPlayer"
        />
        <Table
            v-if="renderCondition && !loading && isPlayerRegistered"
            :table="table"
            :actionsHandlers="actionsHandlers"
            :userPlayerId="playerId"
            :basicStrategyProgress="-1"
            :isUserPlayerHandler="isUserPlayer"
            :evaluteDecisions="false"
            :displayDecisionHelp="false"
            :startRoundButtonText="'Place bet'"
        />
    </div>
</template>

<script lang="ts">
    import { Player, Table as TableModel, PlayerActions } from 'webjack-core';
    import { ActionsBarHandlers } from '../utils/handlers-types';
    import { get } from '../utils/http';
    import { stallPromise } from '../utils/shared';
    import Loader from './Loader.vue';
    import RemoteRegister from './RemoteRegister.vue';
    import Table from './Table.vue';

    export default {
        name: 'RemoteTable',
        components: {
            Loader,
            RemoteRegister,
            Table
        },
        props: {
            renderCondition: {
                type: Boolean,
                default: true
            },
            serverUrl: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                isPlayerRegistered: false,
                loading: false,
                table: {} as TableModel,
                tableInterval: undefined
            };
        },
        created() {
            this.setLoading(true);
            stallPromise(get(this.serverUrl, 'session-data', 'Error checking whether the player is already registered'))
                .then(data => {
                    this.playerId = data.playerId;
                    if (this.playerId) {
                        this.isPlayerRegistered = true;
                        this.tableId = data.tableId;
                        if (this.tableId) {
                            this.setUpdateInterval();
                        }
                        else if (this.renderCondition) {
                            this.joinTable();
                        }
                        else {
                            this.setLoading(false);
                        }
                    }
                    else {
                        this.setLoading(false);
                    }
                })
                .catch(_ => this.setLoading(false));
        },
        computed: {
            actionsHandlers() {
                return {
                    exitTable: this.requestTableExit,
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
                if (newVal && !oldVal && this.playerId && !this.tableId) {
                    this.setLoading(true);
                    this.joinTable();
                }                
            }
        },
        methods: {
            cancelRegister() {
                this.$emit('TableExited');
            },
            double() {
                this.makeDecision(PlayerActions.Double);
            },
            requestTableExit() {
                this.setLoading(true);
                return stallPromise(get(this.serverUrl, 'exit-table'))
                    .then(() => {
                        this.exitTable();
                        this.setLoading(false);
                    })
                    .catch(_ => this.setLoading(false));
            },
            exitTable() {
                this.tableId = undefined;
                if (this.tableInterval) {
                    clearInterval(this.tableInterval);
                }
                this.tableInterval = undefined;
                this.$emit('TableExited');
            },
            hit() {
                this.makeDecision(PlayerActions.Hit);
            },
            isUserPlayer(player: Player) {
                return player && player.id === this.playerId;
            },
            joinTable() {
                stallPromise(get(this.serverUrl, 'join-table', 'Error trying to join a table'))
                    .then(data => {
                        this.tableId = data.tableId;
                        this.setUpdateInterval();
                    })
                    .catch(_ => {
                        this.exitTable();
                        this.setLoading(false);
                    });
            },
            makeDecision(decision: PlayerActions) {
                get(this.serverUrl, 'make-decision', `Error on ${decision}`, { decision })
            },
            registerPlayer(name: string) {
                this.setLoading(true);
                return stallPromise(get(this.serverUrl, 'register-player','Error registering the player', { name }))
                    .then(data => {
                        this.isPlayerRegistered = true;
                        this.playerId = data.playerId;
                        this.joinTable();
                    })
                    .catch(_ => this.setLoading(false));
            },
            split() {
                this.makeDecision(PlayerActions.Split);
            },
            setLoading(value: boolean) {
                this.loading = value;
                this.$emit(value ? 'LoadingStarted' : 'LoadingFinished');
            },
            setUpdateInterval() {
                const updateTableInterval = () =>
                    get(this.serverUrl, 'table-status', 'Error getting the table status')
                        .then(responseData => this.table = responseData)
                        .catch(_ => this.exitTable());
                this.tableInterval = setInterval(updateTableInterval, 1000);
                this.$emit('TableJoined');
                return updateTableInterval().then(_ => this.setLoading(false));
            },
            stand() {
                this.makeDecision(PlayerActions.Stand);
            },
            startRound() {
                get(this.serverUrl, 'place-bet', 'Error placing the bet', { bet: 1 });
            }
        }
    };
</script>

<style>
    .full-height {
        height: 100%;
    }

    .top-space-20 {
        margin-top: 20px;
    }
</style>