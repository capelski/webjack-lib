<template>
    <div class="container full-height">
        <div class="black-jack-table">
            <div class="table-dealer">
                <Player
                    :isPlayerTurn="isDealerTurn"
                    :isDealer="true"
                    :isUserPlayer="false"
                    :player="table.dealer"
                />
            </div>
            <div class="table-players">
                <Player
                    v-for="playerIndex in [0,1,2,3,4,5,6]"
                    :key="playerIndex"
                    :isPlayerTurn="table.players[playerIndex] && (table.players[playerIndex].id === currentPlayerId)"
                    :isUserPlayer="isUserPlayer(table.players[playerIndex])"
                    :player="table.players[playerIndex]"
                />
            </div>
        </div>
        <ActionsBar
            :actionsHandlers="actionsHandlers"
            :table="table"
            :userPlayer="userPlayer"
            :isPlayerTurn="userPlayerId === currentPlayerId"
            :basicStrategyProgress="basicStrategyProgress"
            :evaluteDecisions="evaluteDecisions"
            :displayDecisionHelp="displayDecisionHelp"
            :startRoundButtonText="startRoundButtonText"
        />
    </div>
</template>

<script lang="ts">
    import Player from './Player.vue';
    import ActionsBar from './ActionsBar.vue';
    import { ActionsBarHandlers } from '../utils/handlers-types';
    import { models, services, types } from 'webjack-core';

    export default {
        name: 'Table',
        components: {
            Player,
            ActionsBar
        },
        props: {
            actionsHandlers: {
                type: ActionsBarHandlers,
                required: true
            },
            basicStrategyProgress: {
                type: Number,
                default: -1
            },
            displayDecisionHelp: {
                type: Boolean
            },
            evaluteDecisions: {
                type: Boolean
            },
            isUserPlayerHandler: {
                type: Function
            },
            startRoundButtonText: {
                type: String,
                required: true
            },
            table: {
                type: models.Table,
                required: true
            },
            userPlayerId: {
                type: String,
                required: true
            }
        },
        computed: {
            currentPlayerId() {
                const currentPlayer = services.tableService.getCurrentPlayer(this.table);
                return currentPlayer ? currentPlayer.id : undefined;
            },
            isDealerTurn() {
                return this.table.status === types.TableStatus.DealerTurn;
            },
            userPlayer() {
                return this.table.players.find(player => player.id === this.userPlayerId);
            }
        },
        methods: {
            isUserPlayer(player: models.Player) {
                return player && this.isUserPlayerHandler(player);
            }
        }
    };
</script>

<style>
    .full-height {
        background-color: #088446;
        height: 100%;
    }

    .black-jack-table {
        display: flex;
        flex-direction: column;
        height: calc(100% - 89px);
        overflow: hidden;
    }

    .table-dealer {
        margin-top: 20px;
    }
    @media(min-width: 992px) {
        .table-dealer {
            width: 300px;
            margin: 0 auto;
            margin-top: 20px;
            text-align: center;
        }
    }

    .table-players {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        overflow-y: auto;
        overflow-x: hidden;
    }
    
    @media(min-width: 992px) {
        .table-players {
            margin-top: 0;
            flex-direction: row;
        }
    }
</style>