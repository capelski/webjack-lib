<template>
    <!-- <AjaxTable serverUrl="http://localhost:3000/api" /> -->
    <!-- <LocalTable /> -->
    <!-- <TrainingTable /> -->
    <WebsocketTable websocketUrl="ws://localhost:13000"/>
</template>

<script lang="ts">
    import AjaxTable from './components/AjaxTable.vue';
    import LocalTable from './components/LocalTable.vue';
    import TrainingTable from './components/TrainingTable.vue';
    import WebsocketTable from './components/WebsocketTable.vue';

    export default {
        name: 'Development',
        components: {
            AjaxTable,
            LocalTable,
            TrainingTable,
            WebsocketTable
        }
    };
</script>

<style>
    html, body {
        height: 100%;
        background-color: #088446;
        color: #EEDC82;
    }
</style>