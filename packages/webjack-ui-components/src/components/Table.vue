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
            :trainingProgress="trainingProgress"
            :evaluteDecisions="evaluteDecisions"
            :displayDecisionHelp="displayDecisionHelp"
            :startRoundButtonText="startRoundButtonText"
        />
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Component, Prop } from 'vue-property-decorator';
    import { models, services, types } from 'webjack-core';
    import { IActionsBarHandlers } from '../utils/types';
    import Player from './Player.vue';
    import ActionsBar from './ActionsBar.vue';

    @Component({
        components: {
            Player,
            ActionsBar
        }
    })
    export default class Table extends Vue {
        @Prop({ required: true })
        actionsHandlers: IActionsBarHandlers;

        @Prop({ default: -1 })
        trainingProgress: number;

        @Prop()
        displayDecisionHelp: boolean;

        @Prop()
        evaluteDecisions: boolean;

        @Prop()
        isUserPlayerHandler: (player?: models.IPlayer) => boolean;

        @Prop({ required: true })
        startRoundButtonText: string;

        @Prop({ required: true })
        table: models.ITable;

        @Prop({ required: true })
        userPlayerId: string;

        get currentPlayerId() {
            const currentPlayer = services.tableService.getCurrentPlayer(this.table);
            return currentPlayer ? currentPlayer.id : undefined;
        }

        get isDealerTurn() {
            return this.table.status === types.TableStatus.DealerTurn;
        }
        
        get userPlayer() {
            return this.table.players.find(player => player.id === this.userPlayerId);
        }

        isUserPlayer(player?: models.IPlayer) {
            return player && this.isUserPlayerHandler(player);
        }
    }
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