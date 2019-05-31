<template>
    <div class="progress count-down">
        <div
            role="progressbar"
            :class="{'progress-bar': true, 'animate': countdownAnimation, 'active-player': isPlayerTurn}"
            :style="{width: (countdownStart ? Math.floor(((secondsLeft - 1) / (countdownStart - 1)) * 100) : 0) + '%'}">
        </div>
    </div>
</template>

<script lang="ts">
    import { models } from 'webjack-core';

    interface CountdownData {
        countdownAnimation: boolean;
        countdownStart: number | undefined;
        secondsLeft: number | undefined;
        secondsLeftInterval: number | undefined;
        tableLastestTimestamp: number | undefined;
    }

    export default {
        name: 'Countdown',
        props: {
            table: {
                type: models.Table,
                required: true
            },
            isPlayerTurn: {
                type: Boolean
            }
        },
        data() {
            return {
                countdownAnimation: false,
                countdownStart: undefined,
                secondsLeft: undefined,
                secondsLeftInterval: undefined,
                tableLastestTimestamp: undefined,
            } as CountdownData;
        },
        mounted() {
            this.secondsLeftInterval = setInterval(() => {
                if (!this.table.nextActionTimestamp) {
                    this.secondsLeft = this.countdownStart = undefined;
                }
                else {
                    const diff = (this.table.nextActionTimestamp - (this.table.baseTimestamp || Date.now()));
                    const secondsDiff = Math.floor(diff / 1000);
                    if (this.table.nextActionTimestamp !== this.tableLastestTimestamp) {
                        this.countdownAnimation = false;
                        this.tableLastestTimestamp = this.table.nextActionTimestamp;
                        this.countdownStart = secondsDiff;
                    }
                    else {
                        this.countdownAnimation = true;
                    }
                    this.secondsLeft = secondsDiff;
                }
            }, 1000);
        },
        beforeDestroy() {
            clearInterval(this.secondsLeftInterval);
        }
    };
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
