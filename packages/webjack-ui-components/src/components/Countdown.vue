<template>
    <div class="progress count-down">
        <div
            role="progressbar"
            :class="{'progress-bar': true, 'animate': countdownAnimation, 'active-player': isPlayerTurn}"
            :style="{width: countdownWidth + '%'}">
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import { types } from 'webjack-core';
    import { INullableValueReference } from '../utils/types';

    @Component({})
    export default class Countdown extends Vue {
        // TODO Replace with the nextActionTimestamp
        @Prop({ required: true })
        table: types.ITable;

        @Watch('table')
        tableChanged(newValue: types.ITable, oldValue: types.ITable) {
            if (newValue.nextActionTimestamp && !oldValue.nextActionTimestamp) {
                this.setCountdownInterval();
            }
            else if (!newValue.nextActionTimestamp && oldValue.nextActionTimestamp) {
                this.clearCountdownInterval();
            }
        }
        
        @Prop()
        isPlayerTurn: boolean;

        countdownAnimation = false;
        countdownStart: INullableValueReference<number> = { value: undefined };
        secondsLeft: INullableValueReference<number> = { value: undefined };
        secondsLeftInterval: INullableValueReference<number> = { value: undefined };
        tableLastestTimestamp: INullableValueReference<number> = { value: undefined };

        get countdownWidth() {
            return this.countdownStart.value ? Math.floor(((this.secondsLeft.value - 1) / (this.countdownStart.value - 1)) * 100) : 0;
        }

        clearCountdownInterval() {
            if (this.secondsLeftInterval.value) {
                clearInterval(this.secondsLeftInterval.value);
                Vue.set(this, 'secondsLeftInterval', { value: undefined });
            }
        }

        setCountdownInterval() {
            const interval = window.setInterval(() => {
                if (!this.table.nextActionTimestamp) {
                    Vue.set(this, 'secondsLeft', { value: undefined });
                    Vue.set(this, 'countdownStart', { value: undefined });
                    Vue.set(this, 'tableLastestTimestamp', { value: undefined });
                }
                else {
                    const diff = (this.table.nextActionTimestamp - (this.table.baseTimestamp || Date.now()));
                    const secondsDiff = Math.floor(diff / 1000);
                    if (this.table.nextActionTimestamp !== this.tableLastestTimestamp.value) {
                        Vue.set(this, 'countdownAnimation', false);
                        Vue.set(this, 'tableLastestTimestamp', { value: this.table.nextActionTimestamp });
                        Vue.set(this, 'countdownStart', { value: secondsDiff });
                    }
                    else {
                        Vue.set(this, 'countdownAnimation', true);
                    }
                    Vue.set(this, 'secondsLeft', { value: secondsDiff });
                }
            }, 1000);
            Vue.set(this, 'secondsLeftInterval', { value: interval });
        }

        private beforeDestroy() {
            this.clearCountdownInterval();
        }
    }
</script>

<style>
    .progress.count-down {
        margin: 0;
        height: 10px;
        background-color: transparent;
        -webkit-box-shadow: none;
        box-shadow: none;
    }

    .progress.count-down .progress-bar.animate {
        transition: width 2s;
    }

    .progress.count-down .progress-bar.active-player {
        background-color: #EEDC82;
    }
</style>
