<template>
    <div class="container full-height">
        <div class="black-jack-table">
            <div class="table-dealer">
                <Player
                    :currentPlayerId="currentPlayerId"
                    :isDealer="true"
                    :isUserPlayer="false"
                    :player="table.dealer"
                />
            </div>
            <div class="table-players">
                <Player
                    v-for="playerIndex in [0,1,2,3,4,5,6]"
                    :key="playerIndex"
                    :currentPlayerId="currentPlayerId"
                    :isUserPlayer="isUserPlayer(table.players[playerIndex])"
                    :player="table.players[playerIndex]"
                />
            </div>
        </div>
        <ActionsBar
            :actionsHandlers="actionsHandlers"
            :table="table"
            :userPlayer="userPlayer"
            :currentPlayerId="currentPlayerId"
            :isPlayerTurn="isPlayerTurn"
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
    import { Player as PlayerModel, Table, tableService } from 'webjack-core';

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
                type: Table,
                required: true
            },
            // TODO Replace by userId. If is null, all players are user players
            userPlayer: {
                type: PlayerModel
            }
        },
        computed: {
            currentPlayerId() {
                const currentPlayer = tableService.getCurrentPlayer(this.table);
                return currentPlayer ? currentPlayer.id : undefined;
            },
            isPlayerTurn() {
                // TODO Simplify once the currentPlayerId doesn't return the dealer
                return this.currentPlayerId && this.userPlayer && this.userPlayer.id === this.currentPlayerId;
            }
        },
        methods: {
            isUserPlayer(player: PlayerModel) {
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