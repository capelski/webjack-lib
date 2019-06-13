<template>
    <div :class="{'shake': hasTimeout, 'inline': displayInline }" v-html="html"></div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Component, Prop, Watch } from 'vue-property-decorator';
    import { INullableValueReference } from '../utils/types';

    @Component
    export default class ShakyElement extends Vue {
        @Prop({ required: true })
        html: string;

        @Prop({ default: false })
        displayInline: boolean;
        
        shakyTimeout: INullableValueReference<number> = { value: undefined };

        @Watch('html')
        htmlChanged(newValue: boolean, oldValue: boolean) {
            if (newValue !== oldValue) {
                if (this.hasTimeout) {
                    clearTimeout(this.shakyTimeout.value);
                }
                const timeout = window.setTimeout(() => Vue.set(this, 'shakyTimeout', { value: undefined }), 400);
                Vue.set(this, 'shakyTimeout', { value: timeout });
            }
        }

        get hasTimeout() {
            return !!this.shakyTimeout.value;
        }
    }
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

    .inline {
        display: inline-block;
    }
</style>
