<template>
    <div :class="isDealer ? 'dealer-card': 'player-card'">
        <div
            v-if="player"
            :class="{ 'player-wrapper': true, 'user': isUserPlayer, 'active': isPlayerTurn }"
        >
            <div class="player-status">
                <div class="earnings">
                    <span
                        class="bubble inverted clickable"
                        v-if="!isDealer"
                        @click="showEarningsHistoryModal"
                    >
                        <ShakyElement
                            :displayInline="true"
                            :html="(player.earningRate > 0 ? '+' : '' ) + player.earningRate"
                        />
                    </span>
                </div>
                <div class="player-name">{{ player.name }}</div>
            </div>

            <div class="hands">
                <ul v-if="player.hands && player.hands.length > 0">
                    <li
                        v-for="(hand, handIndex) in player.hands"
                        :key="handIndex"
                        :class="{'text-center': true, 'highlighted-hand': mustHighlightHand(hand)}"
                    >
                        <span
                            v-for="(card, cardIndex) in hand.cards"
                            :key="cardIndex"
                            :class="{ 'card': true, 'red': card.suit === '♦' || card.suit === '♥', 'black': card.suit === '♠' || card.suit === '♣'}"
                        >{{ card.symbol + card.suit }}</span>
                        <span class="hand-data">
                            <span class="bubble left inverted">
                                <ShakyElement
                                    :displayInline="true"
                                    :html="isDealer ? '-' : hand.bet"
                                />
                            </span>
                            <span class="bubble right">
                                <ShakyElement
                                    :displayInline="true"
                                    :html="hand.values.join(' / ')"
                                />
                            </span>
                        </span>
                        <div class="hand-status">
                            <ShakyElement :html="showHandStatus(hand) ? hand.status : ''" />
                        </div>
                    </li>
                </ul>
            </div>

            <modal :name="`earnings-history-${player.name}`" height="auto">
                <apexchart width="100%" type="line" :options="chartOptions" :series="series"></apexchart>
            </modal>
        </div>
        <div v-if="!player" class="free-seat">Free slot</div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { types } from 'webjack-core';
import ShakyElement from './ShakyElement.vue';

@Component({
    components: {
        ShakyElement
    }
})
export default class Player extends Vue {
    @Prop()
    isPlayerTurn: boolean;

    @Prop({ default: false })
    isDealer: boolean;

    @Prop()
    isUserPlayer: boolean;

    @Prop()
    player: types.IPlayer;

    showEarningsHistoryModal() {
        if (this.player) {
            this.$modal.show(`earnings-history-${this.player.name}`);
        }
    }

    mustHighlightHand(hand: types.IHand) {
        return (
            this.isPlayerTurn &&
            this.player.hands.length > 1 &&
            this.player.hands.find(h => h.status === types.HandStatus.Unplayed) === hand
        );
    }

    showHandStatus(hand: types.IHand) {
        return (
            hand.status !== types.HandStatus.Unplayed && hand.status !== types.HandStatus.Unresolved
        );
    }

    chartOptions: any;
    series: any;

    constructor() {
        super();
        if (this.player) {
            this.chartOptions = {
                chart: {
                    id: `${this.player.name}-earnings`,
                    toolbar: {
                        show: false
                    }
                },
                tooltip: {
                    enabled: true,
                    x: {
                        show: false
                    },
                    y: {
                        show: false
                    }
                },
                xaxis: {
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: true
                    },
                    labels: {
                        show: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                yaxis: {
                    labels: {
                        show: false
                    }
                }
            };
            this.series = [
                {
                    name: 'Earnings',
                    data: this.player.earningHistory
                }
            ];
        }
    }
}
</script>

<style lang="scss">
.card {
    font-size: 20px;

    &.black {
        color: black;
    }

    &.red {
        color: red;
    }
}

.player-card {
    flex-grow: 1;
    flex-basis: 0;
    margin-top: 15px;

    &:first-child {
        margin-top: 0;
    }

    @media (min-width: 992px) {
        margin-top: 20px;
        padding-right: 10px;
        max-width: 14.28%;

        &:first-child {
            margin-top: 20px;
        }

        &:last-child {
            padding-right: 0;
        }
    }
}

.dealer-card {
    margin: auto;

    .player-wrapper .player-status .player-name {
        padding-bottom: 0;
    }
}

@media (min-width: 992px) {
    .dealer-card {
        width: 300px;
    }
}

.player-wrapper {
    background-color: white;
    color: black;
    padding: 8px 5px;
    display: flex;
    flex-direction: row;
    align-items: center;

    @media (min-width: 992px) {
        padding: 10px 0;
        display: block;
    }

    > * {
        flex-grow: 1;
        flex-basis: 0;
    }

    .player-status {
        display: flex;
        align-items: baseline;
        max-width: 50%;

        @media (min-width: 992px) {
            flex-direction: column;
            max-width: unset;
            align-items: center;
        }

        .player-name {
            padding: 0;
            font-size: 20px;
            margin: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            @media (min-width: 992px) {
                padding: 10px;
                padding-top: 0;
                text-align: center;
            }
        }

        .earnings {
            font-size: 18px;
            text-align: right;
            display: inline-block;
            padding-right: 5px;

            @media (min-width: 992px) {
                text-align: center;
                padding-bottom: 10px;
                padding-right: 0;
            }
        }
    }

    .hands ul {
        padding: 0 7px;
        margin: 0;

        @media (min-width: 992px) {
            padding: 0;
            margin-top: 10px;
        }

        .hand-data {
            display: inline-block;
            margin-top: 4px;
        }

        .hand-status {
            margin-top: 4px;
        }

        li {
            list-style-type: none;
            margin-top: 5px;
            padding-top: 5px;
            padding-bottom: 5px;
            border-top: 1px dashed #088446;

            &:first-child {
                margin-top: 0;
                border-top: none;
            }

            &.highlighted-hand {
                background-color: #f3e6a7;
            }
        }
    }

    .bubble {
        font-size: 18px;
        padding: 3px 7px;
        border: 2px solid black;
        color: black;
        border-radius: 10px;

        &.left {
            border-radius: 10px 0 0 10px;
            margin-right: -2.5px;
        }
        &.right {
            border-radius: 0 10px 10px 0;
            margin-left: -2.5px;
        }

        &.inverted {
            border: 2px solid black;
            background-color: black;
            color: white;
        }
    }

    &.user {
        .player-name,
        .earnings,
        .hands li,
        .bubble {
            color: #3071a9;
        }

        .bubble {
            border: 2px solid #3071a9;
        }

        .bubble.inverted {
            border: 2px solid #3071a9;
            background-color: #3071a9;
            color: white;
        }
    }

    &.active {
        background-color: #eedc82;
    }

    &.active,
    &.active .player-name,
    &.active .earnings,
    &.active .hands li,
    &.active .hands li .card.black,
    &.active .bubble,
    &.user.active .player-name,
    &.user.active .earnings,
    &.user.active .hands li,
    &.user.active .hands li .card.black,
    &.user.active .bubble {
        color: white;
    }

    &.active .bubble,
    &.user.active .bubble {
        border: 2px solid white;
    }

    &.active .bubble.inverted,
    &.user.active .bubble.inverted {
        border: 2px solid white;
        background-color: white;
        color: #eedc82;
    }
}

.free-seat {
    background-color: white;
    color: black;
    padding: 5px 0;
    font-size: 20px;
    text-align: center;

    @media (min-width: 992px) {
        padding: 30px 10px;
    }
}
</style>
