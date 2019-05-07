<template>
    <div class="centered">
        <div class="container">
            <div class="row">
                <div class="col-xs-12 text-center">
                    <span class="avatar">&#9815;</span>
                </div>
            </div>

            <div class="row top-space-20">
                <div class="col-sm-4 col-sm-offset-4">
                    <input type="text" class="form-control" v-model="playerName" />
                </div>
            </div>

            <div class="row top-space-20">
                <div class="col-xs-12 text-center">
                    <button type="button" class="btn btn-primary"
                        v-on:click="registerPlayer"
                        :disabled="!playerName"
                    >
                        Join table
                    </button>
                    <button type="button" class="btn btn-danger"
                        v-on:click="cancelRegisterHandler"
                    >
                        Cancel
                    </button>
                </div>
            </div>        
        </div>
    </div>
</template>

<script lang="ts">
    export default {
        name: 'RegisterOnline',
        data () {
            return {
                playerName: null
            }
        },
        props: {
            registerPlayerHandler: {
                type: Function,
                required: true
            },
            cancelRegisterHandler: {
                type: Function,
                required: true
            }
        },
        methods: {
            registerPlayer() {
                this.registerPlayerHandler(this.playerName);
            }
        }
    };
</script>

<style>
    .avatar {
        font-size: 100px;
    }
</style>
