<template>
        <div :class="{'shake': shakyTimeout }" v-html="html"></div>
</template>

<script lang="ts">
    interface ShakyElementData {
        shakyTimeout: number | undefined;
    }

    export default {
        name: 'ShakyElement',
        props: {
            html: {
                required: true
            }
        },
        data(): ShakyElementData {
            return {
                shakyTimeout: undefined,
            };
        },
        watch: {
            html(newValue, oldValue) {
                if (newValue !== oldValue) {
                    clearTimeout(this.shakyTimeout);
                    this.shakyTimeout = setTimeout(() => this.shakyTimeout = undefined, 400);
                }
            }
        }
    };
</script>

<style>
    @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
    }

    .shake {
        font-weight: bold;
        animation: shake 0.4s;
    }
</style>
