<template>
    <div>
        <div class="actions-bar">
            <Countdown
                :table="table"
                :isPlayerTurn="isPlayerTurn"
            />
            <div class="actions-area">
                <div class="row">
                    <div class="col-xs-12 text-center">
                        <div class="table-actions" v-if="!isPlayerTurn">
                            <button type="button" class="btn btn-primary"
                                :class="{'disabled-action': isUserPlaying }"
                                v-on:click="startRound">
                                {{ startRoundButtonText }}
                            </button>
                            <button type="button" class="btn btn-danger"
                                :class="{'disabled-action': isUserPlaying }"
                                v-on:click="exitTable">
                                Exit table
                            </button>
                        </div>
                        <PlayerActions 
                            :dealer="table.dealer"
                            :userPlayer="userPlayer"
                            :isPlayerTurn="isPlayerTurn"
                            :trainingProgress="trainingProgress"
                            :actionsHandlers="actionsHandlers"
                            :evaluteDecisions="evaluteDecisions"
                            :displayDecisionHelp="displayDecisionHelp"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import toastr from 'toastr';
    import { models, services } from 'webjack-core';
    import { ActionsBarHandlers } from '../utils/handlers-types';
    import Countdown from './Countdown.vue';
    import PlayerActions from './PlayerActions.vue';

    export default {
        name: 'ActionsBar',
        components: {
            Countdown,
            PlayerActions
        },
        props: {
            actionsHandlers: {
                type: ActionsBarHandlers,
                required: true
            },
            trainingProgress: {
                type: Number
            },
            displayDecisionHelp: {
                type: Boolean
            },
            evaluteDecisions: {
                type: Boolean
            },
            isPlayerTurn: {
                type: Boolean
            },
            startRoundButtonText: {
                type: String,
                required: true
            },
            table: {
                type: models.Table,
                required: true
            },
            userPlayer: {
                type: models.Player
            }
        },
        computed: {
            isUserPlaying() {
                return this.userPlayer && services.playerService.isPlaying(this.userPlayer);
            }
        },
        methods: {
            exitTable() {
                if (this.isUserPlaying) {
                    toastr.error('You cannot leave the table while playing a round', 'Round in progress');
                }
                else {
                    this.actionsHandlers.exitTable();
                }
            },
            startRound() {
                if (this.isUserPlaying) {
                    toastr.error('Wait for the current round to finish before starting the next one', 'Round in progress');
                }
                else {
                    this.actionsHandlers.startRound();
                }
            }
        }
    };
</script>

<style>
    .actions-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .actions-bar .actions-area {
        padding: 15px;
        background-color: black;
    }

    .actions-bar .actions-area .table-actions,
    .actions-bar .actions-area .basic-strategy-counter {
        display: inline-block;
    }

    .disabled-action {
        opacity: 0.65;
    }

    /* Using max-width instead of a mobile first approach due to be overriding bootstrap */
    @media(max-width: 768px) {
        .actions-area .row .col-xs-12 {
            padding-left: 0;
            padding-right: 0;
        }

        .actions-area .row .col-xs-12 .btn {
            padding: 6px;
        }
    }
</style>
