<template>
    <div :class="isDealer ? 'dealer-card': 'player-card'">
        <div
            v-if="player"
            :class="{ 'player-wrapper': true, 'user': isUserPlayer, 'active': isPlayerTurn }"
        >
            <div class="player-status">
                <div class="player-name">{{ player.name }}</div>
                <div class="earnings">
                    <span class="bubble inverted" v-if="!isDealer">
                        <ShakyElement
                            :displayInline="true"
                            :html="(player.earningRate > 0 ? '+' : '' ) + player.earningRate"
                        />
                    </span>
                </div>
            </div>

            <div class="hands">
                <ul v-if="player.hands && player.hands[0] && player.hands[0].cards.length > 0">
                    <li v-for="(hand, handIndex) in player.hands" :key="handIndex" class="text-center">
                        <span v-for="(card, cardIndex) in hand.cards"
                            :key="cardIndex"
                            :class="{ 'card': true, 'red': card.suit === '♦' || card.suit === '♥', 'black': card.suit === '♠' || card.suit === '♣'}">
                            {{ card.symbol + card.suit }}
                        </span>
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
        </div>
        <div v-if="!player" class="free-seat">
            Free slot
        </div>
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

        showHandStatus(hand: types.IHand) {
            return hand.status !== types.HandStatus.Unplayed && hand.status !== types.HandStatus.Unresolved;
        }
    }
</script>

<style lang="scss">
    .card {
        font-size: 20px;
    }
    .card.black {
        color: black;
    }
    .card.red {
        color: red;
    }
    
    .player-card {
        flex-grow: 1;
        flex-basis: 0;
        margin-top: 15px;

        &:first-child {
            margin-top: 0;
        }

        @media(min-width: 992px) {
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
    @media(min-width: 992px) {
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
    }
    @media(min-width: 992px) {
        .player-wrapper {
            padding: 10px 0;
            display: block;
        }
    }

    .player-wrapper > * {
        flex-grow: 1;
        flex-basis: 0;
    }

    .player-wrapper .player-status {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        max-width: 50%;

        @media(min-width: 992px) {
            flex-direction: column;
            max-width: unset;
            align-items: center;
        }
    }

    .player-wrapper .player-status .player-name {
        padding: 0 10px;
        font-size: 20px;
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 60%;
    }
    @media(min-width: 992px) {
        .player-wrapper .player-status .player-name {
            padding: 10px;
            padding-top: 0;
            text-align: center;
            max-width: unset;
        }
    }

    .player-wrapper .player-status .earnings {
        font-size: 18px;
        min-width: 40%;
        text-align: right;
    }
    @media(min-width: 992px) {
        .player-wrapper .player-status .earnings {
            text-align: center;
            padding-bottom: 10px;
            min-width: unset;
        }
    }

    .player-wrapper .hands ul {
        padding: 0 7px;
        margin: 0;

        @media(min-width: 992px) {
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
    }

    .player-wrapper .hands ul li {
        list-style-type: none;
        margin-top: 5px;
        padding-top: 5px;
        border-top: 1px dashed #088446;
    }
    .player-wrapper .hands ul li:first-child {
        list-style-type: none;
        margin-top: 0;
        padding-top: 0;
        border-top: none;
    }
    @media(min-width: 992px) {
        .player-wrapper .hands ul li {
            margin: 0 10px;
            margin-top: 10px;
            padding-top: 10px;
        }
    }
    
    .player-wrapper .bubble {
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
    }
    .player-wrapper .bubble.inverted {
        border: 2px solid black;
        background-color: black;
        color: white;
    }

    .player-wrapper.user .player-name,
    .player-wrapper.user .earnings,
    .player-wrapper.user .hands li,
    .player-wrapper.user .bubble {
        color: #3071a9;
    }
    .player-wrapper.user .bubble {
        border: 2px solid #3071a9;
    }
    .player-wrapper.user .bubble.inverted {
        border: 2px solid #3071a9;
        background-color: #3071a9;
        color: white;
    }

    .player-wrapper.active {
        background-color: #EEDC82;
    }
    .player-wrapper.active,
    .player-wrapper.active .player-name,
    .player-wrapper.active .earnings,
    .player-wrapper.active .hands li,
    .player-wrapper.active .hands li .card.black,
    .player-wrapper.active .bubble,
    .player-wrapper.user.active .player-name,
    .player-wrapper.user.active .earnings,
    .player-wrapper.user.active .hands li,
    .player-wrapper.user.active .hands li .card.black,
    .player-wrapper.user.active .bubble {
        color: white;
    }
    .player-wrapper.active .bubble,
    .player-wrapper.user.active .bubble {
        border: 2px solid white;
    }
    .player-wrapper.active .bubble.inverted,
    .player-wrapper.user.active .bubble.inverted {
        border: 2px solid white;
        background-color: white;
        color: #EEDC82;
    }

    .free-seat {
        background-color: white;
        color: black;
        padding: 5px 0;
        font-size: 20px;
        text-align: center;
    }
    @media(min-width: 992px) {
        .free-seat {
            padding: 30px 10px;
        }
    }
</style>
