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
            :class="{'basic-strategy-progress': true }"
            v-if="evaluteDecisions"
            :html="(basicStrategyProgress !== -1 ? basicStrategyProgress : 0) + ' &#10227;'"
        />
        <ShakyElement
            :class="{'basic-strategy-counter': true }"
            v-if="evaluteDecisions"
            :html="(basicStrategyAttempts ? Math.floor(basicStrategyHits * 1000 / basicStrategyAttempts) / 10 : 0) + '%'"
        />
    </div>
</template>

<script lang="ts">
    import toastr from 'toastr';
    import { blackJackService, Player, playerService, handService, basicStrategyService, PlayerActions } from 'webjack-core';
    import { PlayerActionsHandlers } from '../utils/handlers-types';
    import ShakyElement from './ShakyElement.vue';

    interface PlayerActionsData {
        basicStrategyAttempts: number;
        basicStrategyHits: number;
    }

    export default {
        name: 'PlayerActions',
        components: {
            ShakyElement
        },
        props: {
            actionsHandlers: {
                type: PlayerActionsHandlers,
                required: true
            },
            basicStrategyProgress: {
                type: Number,
                default: -1,
            },
            // TODO Replace by dealer hand
            dealer: {
                type: Player,
                required: true
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
            // TODO Replace by user hand
            userPlayer: {
                type: Player
            }
        },
        data() {
            return {
                basicStrategyAttempts: 0,
                basicStrategyHits: 0
            } as PlayerActionsData;
        },
        computed: {
            canDouble() {
                const hand = playerService.getCurrentHand(this.userPlayer);
                return blackJackService.canDouble(hand!);
            },
            canSplit() {
                const hand = playerService.getCurrentHand(this.userPlayer);
                return blackJackService.canSplit(hand!);
            },
            dealerScore() {
                let dealerScore;
                const dealerHand = playerService.getCurrentHand(this.dealer);
                if (dealerHand) {
                    dealerScore = handService.getValue(dealerHand);
                }
                return dealerScore;
            }
        },
        methods: {
            displayOptimalDecision() {
                const hand = playerService.getCurrentHand(this.userPlayer);
                const optimalDecisionInfo = basicStrategyService.getOptimalDecision(hand!, this.dealerScore!).description;
                toastr.info(optimalDecisionInfo, 'Basic strategy');
            },
            double() {
                if (this.canDouble) {
                    if (this.evaluteDecisions) {
                        this.evaluatePlayerDecision(PlayerActions.Double);
                    }
                    this.actionsHandlers.double();
                }
                else {
                    toastr.error('Doubling is only allowed with 9, 10 or 11 points', 'Action not allowed');
                }
            },
            evaluatePlayerDecision(userDecision: PlayerActions) {
                const hand = playerService.getCurrentHand(this.userPlayer!);
                const optimalDecision = basicStrategyService.getOptimalDecision(hand!, this.dealerScore!);
                this.basicStrategyAttempts++;
                if (optimalDecision.action == userDecision) {
                    this.basicStrategyHits++;
                }
                else {
                    toastr.error(`Wrong! ${optimalDecision.description}`, 'Basic strategy');
                }
            },
            hit() {
                if (this.evaluteDecisions) {
                    this.evaluatePlayerDecision(PlayerActions.Hit);
                }
                this.actionsHandlers.hit();
            },
            split() {
                if (this.canSplit) {
                    if (this.evaluteDecisions) {
                        this.evaluatePlayerDecision(PlayerActions.Split);
                    }
                    this.actionsHandlers.split();
                }
                else {
                    toastr.error('Splitting is only allowed with two equal cards', 'Action not allowed');
                }
            },
            stand() {
                if (this.evaluteDecisions) {
                    this.evaluatePlayerDecision(PlayerActions.Stand);
                }
                this.actionsHandlers.stand();
            }
        }
    };
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

    .basic-strategy-progress {
        color: white;
    }

    .basic-strategy-progress,
    .basic-strategy-counter {
        padding-left: 5px;
        font-size: 14px;
    }

    @media(min-width: 768px) {
        .basic-strategy-progress,
        .basic-strategy-counter {
            font-size: 18px;
        }
    }
</style>
