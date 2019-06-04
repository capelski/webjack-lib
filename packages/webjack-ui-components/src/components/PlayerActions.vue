<template>
    <div class="player-actions">
        <div v-if="isPlayerTurn">
            <button type="button" class="btn btn-primary" v-on:click="hit">
                Hit
            </button>
            <button type="button" class="btn btn-info" v-on:click="stand">
                Stand
            </button>
            <button type="button" class="btn btn-success"
                :class="{'disabled-action': !canSplit }"
                v-on:click="split">
                Split
            </button>
            <button type="button" class="btn btn-danger"
                :class="{'disabled-action': !canDouble }"
                v-on:click="double">
                Double
            </button>

            <button
                class="btn optimal-decision"
                v-on:click="displayOptimalDecision"
                v-if="displayDecisionHelp"
            >
                &#9873;
            </button>
        </div>

        <!-- TODO Place directly in the ActionsBar component and remove the isPlayerTurn prop -->
        <ShakyElement
            :class="{'training-progress': true }"
            v-if="evaluteDecisions"
            :html="(trainingProgress !== -1 ? trainingProgress : 0) + ' &#10227;'"
        />
        <ShakyElement
            :class="{'training-counter': true }"
            v-if="evaluteDecisions"
            :html="trainingPercentage + '%'"
        />
    </div>
</template>

<script lang="ts">
    import toastr from 'toastr';
    import Vue from 'vue';
    import { Component, Prop } from 'vue-property-decorator';
    import { services, types, utils } from 'webjack-core';
    import { IPlayerActionsHandlers, IValueReference } from '../utils/types';
    import ShakyElement from './ShakyElement.vue';

    @Component({
        components: {
            ShakyElement
        }
    })
    export default class PlayerActions extends Vue {
        @Prop({ required: true })
        actionsHandlers: IPlayerActionsHandlers;

        @Prop({ default: -1 })
        trainingProgress: number;
        
        // TODO Replace by dealer hand
        @Prop({ required: true })
        dealer: types.IPlayer;

        @Prop()
        displayDecisionHelp: boolean;

        @Prop()
        evaluteDecisions: boolean;

        @Prop()
        isPlayerTurn: boolean;

        // TODO Replace by user hand
        @Prop()
        userPlayer: types.IPlayer;

        trainingAttempts: IValueReference<number> = { value: 0 };
        trainingHits: IValueReference<number> = { value: 0 };

        get canDouble() {
            const hand = services.playerService.getCurrentHand(this.userPlayer);
            return services.handService.canDouble(hand!);
        }

        get canSplit() {
            const hand = services.playerService.getCurrentHand(this.userPlayer);
            return services.handService.canSplit(hand!);
        }

        get dealerScore() {
            let dealerScore;
            const dealerHand = services.playerService.getCurrentHand(this.dealer);
            if (dealerHand) {
                dealerScore = services.handService.getValue(dealerHand);
            }
            return dealerScore;
        }

        get trainingPercentage() {
            return this.trainingAttempts.value ?
                Math.floor(this.trainingHits.value * 1000 / this.trainingAttempts.value) / 10 : 0;
        }

        displayOptimalDecision() {
            const hand = services.playerService.getCurrentHand(this.userPlayer);
            const optimalDecisionInfo = utils.basicStrategy.getOptimalDecision(hand!, this.dealerScore!).description;
            toastr.info(optimalDecisionInfo, 'Basic strategy');
        }

        double() {
            if (this.canDouble) {
                if (this.evaluteDecisions) {
                    this.evaluatePlayerDecision(types.PlayerActions.Double);
                }
                this.actionsHandlers.double();
            }
            else {
                toastr.error('Doubling is only allowed with 9, 10 or 11 points', 'Action not allowed');
            }
        }

        evaluatePlayerDecision(userDecision: types.PlayerActions) {
            const hand = services.playerService.getCurrentHand(this.userPlayer);
            const optimalDecision = utils.basicStrategy.getOptimalDecision(hand!, this.dealerScore!);
            Vue.set(this, 'trainingAttempts', { value: this.trainingAttempts.value + 1 });
            if (optimalDecision.action === userDecision) {
                Vue.set(this, 'trainingHits', { value: this.trainingHits.value + 1 });
            }
            else {
                toastr.error(`Wrong! ${optimalDecision.description}`, 'Basic strategy');
            }
        }

        hit() {
            if (this.evaluteDecisions) {
                this.evaluatePlayerDecision(types.PlayerActions.Hit);
            }
            this.actionsHandlers.hit();
        }

        split() {
            if (this.canSplit) {
                if (this.evaluteDecisions) {
                    this.evaluatePlayerDecision(types.PlayerActions.Split);
                }
                this.actionsHandlers.split();
            }
            else {
                toastr.error('Splitting is only allowed with two equal cards', 'Action not allowed');
            }
        }

        stand() {
            if (this.evaluteDecisions) {
                this.evaluatePlayerDecision(types.PlayerActions.Stand);
            }
            this.actionsHandlers.stand();
        }
    }
</script>

<style>
    .player-actions,
    .player-actions > div {
        display: inline-block;
    }

    .btn.optimal-decision {
        background-color: transparent;
        outline: none;
        border: none;
        font-size: 25px;
        padding: 0 5px;
    }

    .training-progress {
        color: white;
    }

    .training-progress,
    .training-counter {
        padding-left: 5px;
        font-size: 14px;
    }

    @media(min-width: 768px) {
        .training-progress,
        .training-counter {
            font-size: 18px;
        }
    }
</style>
