<template>
    <div :class="isDealer ? 'dealer-card': 'player-card'">
        <div
            v-if="player"
            :class="{ 'player-wrapper': true, 'user': isUserPlayer, 'active': isPlayerTurn }"
        >
            <div class="player-name text-center">{{ player.name }}</div>
            
            <div class="values" v-if="handValues && handValues.length">
                <span
                    v-for="(handValue, index) in handValues"
                    :key="index"
                >
                    <span class="bubble">
                        <ShakyElement :html="handValue" />
                    </span>
                    <span> </span>
                </span>
            </div>

            <div class="hands" v-if="player.hands && player.hands[0] && player.hands[0].cards.length > 0">
                <ul>
                    <li v-for="(hand, handIndex) in player.hands" :key="handIndex" class="text-center">
                        <span v-for="(card, cardIndex) in hand.cards"
                            :key="cardIndex"
                            :class="{ 'card': true, 'red': card.suit === '♦' || card.suit === '♥', 'black': card.suit === '♠' || card.suit === '♣'}">
                            {{ card.symbol + card.suit }}
                        </span>
                        <div v-if="showHandStatus(hand)">{{ hand.status }}</div>
                    </li>
                </ul>
            </div>

            <div class="earnings">
                <span class="bubble" v-if="!isDealer">
                    <ShakyElement :html="player.hands && player.hands.length > 0 ? player.hands.map(h => h.bet).reduce((x, y) => x + y, 0) : '-'" />
                </span>
                <span class="bubble inverted" v-if="!isDealer">
                    <ShakyElement :html="(player.earningRate > 0 ? '+' : '' ) + player.earningRate" />
                </span>
            </div>
        </div>
        <div v-if="!player" class="free-seat">
            Free seat
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Component, Prop } from 'vue-property-decorator';
    import { models, types } from 'webjack-core';
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
        player: models.IPlayer;

        get handValues(): string[] | undefined {
            let handValues;
            if (this.player && this.player.hands) {
                handValues = this.player.hands.map(hand => hand.values.join(' / ')).filter(Boolean);
            }
            return handValues;
        }

        showHandStatus(hand: models.IHand) {
            return hand.status !== types.HandStatus.Unplayed && hand.status !== types.HandStatus.Unresolved;
        }
    }
</script>

<style>
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
        margin-top: 20px;
    }
    .player-card:first-child {
        margin-top: 0;
    }
    @media(min-width: 992px) {
        .player-card {
            padding-right: 10px;
        }
        .player-card:first-child {
            margin-top: 20px;
        }
        .player-card:last-child {
            padding-right: 0;
        }
    }

    .dealer-card {
        margin: auto;
    }
    @media(min-width: 992px) {
        .dealer-card {
            width: 300px;
        }
    }

    .player-wrapper {
        background-color: white;
        color: black;
        padding: 5px 0;
        display: flex;
        flex-direction: row;
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

    .player-wrapper .player-name {
        padding: 0 5px;
        padding-bottom: 5px;
        padding-top: 7px;
        font-size: 20px;
        margin: 0;
    }
    @media(min-width: 992px) {
        .player-wrapper .player-name {
            padding: 0 10px;
            padding-bottom: 10px;
        }
    }
    .player-wrapper .values {
        text-align: center;
        padding: 5px;
    }
    @media(min-width: 992px) {
        .player-wrapper .values {
            padding: 10px 0;
        }
    }
    .player-wrapper .hands ul {
        padding: 0;
        padding-bottom: 5px;
        padding-top: 7px;
        margin-bottom: 0;
        min-height: 10px;
    }
    @media(min-width: 992px) {
        .player-wrapper .hands ul {
            padding-bottom: 10px;
            padding-top: 0;
        }
    }
    .player-wrapper .hands ul li {
        list-style-type: none;
    }

    .player-wrapper .earnings {
        margin-bottom: 0;
        text-align: center;
        font-size: 18px;
        padding-top: 5px;
    }
    @media(min-width: 992px) {
        .player-wrapper .earnings {
            padding-top: 10px;
        }
    }
    
    .player-wrapper .bubble {
        display: inline-block;
        font-size: 18px;
        padding: 3px 7px;
        border: 2px solid black;
        color: black;
        border-radius: 10px;
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
