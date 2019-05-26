<template>
    <div class="container full-height">
        <Table
            v-if="!loading"
            :table="table"
            :actionsHandlers="actionsHandlers"
            :userPlayer="userPlayer"
            :basicStrategyProgress="-1"
            :isUserPlayerHandler="isUserPlayer"
            :evaluteDecisions="false"
            :displayDecisionHelp="true"
            :startRoundButtonText="'Place bet'"
        />
        <Loader v-if="loading"/>
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

    const getEndpointUrl = (serverUrl: string, endpoint: string) => {
        return serverUrl.indexOf('{endpoint}') > -1 ?
            serverUrl.replace('{endpoint}', endpoint) : 
            serverUrl + `/${endpoint}`;
    };

    export default {
        name: 'RemoteTable',
        components: {
            Table,
            Loader
        },
        props: {
            serverUrl: {
                type: String,
                required: true
            },
            tableId: {
                type: String,
                required: true
            },
            userId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                loading: true,
                table: {} as TableModel,
                tableInterval: undefined
            };
        },
        created() {
            const updateTableInterval = () => get(
                getEndpointUrl(this.serverUrl, 'table-status'),
                null,
                { message: true },
                'Error getting the table status')
            .then(responseData => {
                if (responseData.message) {
                    this.exitTable();
                }
                else {
                    this.table = responseData;
                    this.loading = false;
                }
            });
            
            let tablePromise = Promise.resolve(this.tableId);
            if (!this.tableId) {
                tablePromise = get(
                    getEndpointUrl(this.serverUrl, 'join-table'),
                    null,
                    {},
                    'Error trying to join a table. Please refresh the screen and try again')
                .then(responseData => responseData.tableId);
            }

            tablePromise.then(_ => {
                this.tableInterval = setInterval(updateTableInterval, 1000) as any;
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
                return this.table!.players.find(p => p.id === this.userId);
            }
        },
        methods: {
            double() {
                get(
                    getEndpointUrl(this.serverUrl, 'make-decision'),
                    { decision: PlayerActions.Double },
                    null,
                    'Error on double');
            },
            exitTable() {
                this.loading = true;
                clearInterval(this.tableInterval!);
                stallPromise(get(getEndpointUrl(this.serverUrl, 'exit-table')))
                    .then(() => this.$emit('TableExited'));
            },
            hit() {
                get(
                    getEndpointUrl(this.serverUrl, 'make-decision'),
                    { decision: PlayerActions.Hit },
                    null,
                    'Error on hit');
            },
            isUserPlayer(player: Player) {
                return player && player.id === this.userId;
            },
            split() {
                get(
                    getEndpointUrl(this.serverUrl, 'make-decision'),
                    { decision: PlayerActions.Split },
                    null,
                    'Error on split');
            },
            stand() {
                get(
                    getEndpointUrl(this.serverUrl, 'make-decision'),
                    { decision: PlayerActions.Stand },
                    null,
                    'Error on stand');
            },
            startRound() {
                const bet = 1;
                get(
                    getEndpointUrl(this.serverUrl, 'place-bet'),
                    { bet },
                    null,
                    'Error placing the bet');
            }
        }
    };
</script>

<style>
.black-jack-table {
  display: flex;
  flex-direction: column;
  height: calc(100% - 89px);
  overflow: hidden;
}

.table-dealer {
  margin-top: 20px;
}
@media (min-width: 992px) {
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

@media (min-width: 992px) {
  .table-players {
    margin-top: 0;
    flex-direction: row;
  }
}
</style>