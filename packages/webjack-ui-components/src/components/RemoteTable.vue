<template>
    <div class="full-height" v-if="renderCondition || loading">
        <Loader v-if="loading"/>

        <!-- TODO Extract registering into RemoteRegister component -->
        <div
            class="centered container full-height"
            v-if="renderCondition && !loading && !isPlayerRegistered"
        >
            <div class="row">
                <div class="col-xs-12 text-center">
                    <span class="avatar">&#9815;</span>
                </div>
            </div>

            <div class="row top-space-20">
                <div class="col-sm-4 col-sm-offset-4">
                    <input type="text" class="form-control" v-model="playerName" />
                </div>
            </div>

            <div class="row top-space-20">
                <div class="col-xs-12 text-center">
                    <button type="button" class="btn btn-primary"
                        v-on:click="registerPlayer"
                        :disabled="!playerName"
                    >
                        Join table
                    </button>
                    <button type="button" class="btn btn-danger"
                        v-on:click="cancelRegister"
                    >
                        Cancel
                    </button>
                </div>
            </div>        
        </div>

        <Table
            v-if="renderCondition && !loading && isPlayerRegistered"
            :table="table"
            :actionsHandlers="actionsHandlers"
            :userPlayer="userPlayer"
            :basicStrategyProgress="-1"
            :isUserPlayerHandler="isUserPlayer"
            :evaluteDecisions="false"
            :displayDecisionHelp="true"
            :startRoundButtonText="'Place bet'"
        />
    </div>
</template>

<script lang="ts">
    import Table from './Table.vue';
    import Loader from './Loader.vue';
    import { Player, Table as TableModel, PlayerActions } from 'webjack-core';
    import { ActionsBarHandlers } from '../utils/handlers-types';
    import { get } from '../utils/http';
    import { stallPromise } from '../utils/shared';

    declare const toastr: any;

    export default {
        name: 'RemoteTable',
        components: {
            Loader,
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
                playerName: undefined,
                table: {} as TableModel,
                tableInterval: undefined
            };
        },
        created() {
            this.loading = true;
            this.$emit('LoadingStarted');
            stallPromise(get(this.serverUrl, 'is-player-registered', 'Error checking whether the player is already registered'))
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
                            this.loading = false;
                            this.$emit('LoadingFinished');
                        }
                    }
                    else {
                        this.loading = false;
                        this.$emit('LoadingFinished');
                    }
                })
                .catch(_ => {
                    this.loading = false;
                    this.$emit('LoadingFinished');
                });
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
            userPlayer(): Player | undefined {
                return this.table!.players.find(p => p.id === this.playerId);
            }
        },
        watch: {
            renderCondition(newVal, oldVal) {
                if (newVal && !oldVal && this.playerId && !this.tableId) {
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
            exitTable() {
                this.tableId = undefined;
                this.loading = true;
                this.$emit('LoadingStarted');
                clearInterval(this.tableInterval!);
                stallPromise(get(this.serverUrl, 'exit-table'))
                    .then(() => {
                        this.loading = false;
                        this.$emit('LoadingFinished');
                        this.$emit('TableExited');
                    })
                    .catch(_ => {
                        this.loading = false;
                        this.$emit('LoadingFinished');
                        this.$emit('TableExited');
                    });
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
                        this.setUpdateInterval()
                    })
                    .catch(_ => {
                        this.loading = false;
                        this.$emit('LoadingFinished');
                        this.$emit('TableExited');
                    });
            },
            makeDecision(decision: PlayerActions) {
                get(this.serverUrl, 'make-decision', `Error on ${decision}`, { decision })
            },
            registerPlayer() {
                this.loading = true;
                this.$emit('LoadingStarted');
                return stallPromise(get(this.serverUrl, 'register-player','Error registering the player', { name: this.playerName }))
                    .then(data => {
                        this.isPlayerRegistered = true;
                        this.playerId = data.playerId;
                        this.joinTable();
                    })
                    .catch(_ => {
                        this.loading = false;
                        this.$emit('LoadingFinished');
                    });
            },
            split() {
                this.makeDecision(PlayerActions.Split);
            },
            setUpdateInterval() {
                const updateTableInterval = () =>
                    get(this.serverUrl, 'table-status', 'Error getting the table status')
                        .then(responseData => this.table = responseData)
                        .catch(_ => {
                            this.tableId = undefined;
                            clearInterval(this.tableInterval!);
                            this.$emit('TableExited');
                        });
                this.tableInterval = setInterval(updateTableInterval, 1000);
                this.$emit('TableJoined');
                return updateTableInterval().then(_ => {
                    this.loading = false;
                    this.$emit('LoadingFinished');
                });
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

    .centered {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .top-space-20 {
        margin-top: 20px;
    }

    .avatar {
        font-size: 100px;
    }
</style>