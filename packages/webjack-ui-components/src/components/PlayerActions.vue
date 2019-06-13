<template>
    <div class="player-actions">
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
    </div>
</template>

<script lang="ts">
    import toastr from 'toastr';
    import Vue from 'vue';
    import { Component, Prop } from 'vue-property-decorator';
    import { services, types, utils } from 'webjack-core';
    import { IPlayerActionsHandlers } from '../utils/types';

    @Component
    export default class PlayerActions extends Vue {
        @Prop({ required: true })
        actionsHandlers: IPlayerActionsHandlers;

        @Prop({ required: true })
        userHand: types.IHand;

        get canDouble() {
            return services.handService.canDouble(this.userHand);
        }

        get canSplit() {
            return services.handService.canSplit(this.userHand);
        }

        double() {
            if (this.canDouble) {
                this.actionsHandlers.double();
            }
            else {
                toastr.error('Doubling is only allowed with 9, 10 or 11 points', 'Action not allowed');
            }
        }

        hit() {
            this.actionsHandlers.hit();
        }

        split() {
            if (this.canSplit) {
                this.actionsHandlers.split();
            }
            else {
                toastr.error('Splitting is only allowed with two equal cards', 'Action not allowed');
            }
        }

        stand() {
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
