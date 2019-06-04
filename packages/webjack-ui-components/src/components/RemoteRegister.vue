<template>
    <div class="centered container full-height">
        <div class="row">
            <div class="col-xs-12 text-center">
                <span class="avatar">&#9815;</span>
            </div>
        </div>

        <div class="row top-space-20">
            <div class="col-sm-4 col-sm-offset-4 col-xs-8 col-xs-offset-2">
                <input type="text" class="form-control" v-model="playerName.value" />
            </div>
        </div>

        <div class="row top-space-20">
            <div class="col-xs-12 text-center">
                <button type="button" class="btn btn-primary"
                    v-on:click="registerPlayer"
                    :disabled="!playerName.value"
                >
                    Join table
                </button>
                <button type="button" class="btn btn-danger"
                    v-on:click="cancelRegister"
                >
                    Cancel
                </button>
            </div>
        </div>        
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Component } from 'vue-property-decorator';
    import { INullableValueReference } from '../utils/types';

    @Component
    export default class RemoteRegister extends Vue {
        playerName: INullableValueReference<string> = { value: undefined };
        
        private created() {
            Vue.set(this, 'playerName', { value: undefined });
        }

        cancelRegister() {
            this.$emit('RegisterCanceled');
        }
        
        registerPlayer() {
            this.$emit('RegisterRequested', this.playerName.value);
        }
    }
</script>

<style>
    .full-height {
        height: 100%;
    }

    .centered {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .top-space-20 {
        margin-top: 20px;
    }

    .avatar {
        font-size: 100px;
    }
</style>