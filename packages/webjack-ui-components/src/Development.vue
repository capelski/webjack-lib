<template>
    <!-- <LocalTable /> -->
    <!-- <RemoteTable serverUrl="http://localhost:3000/api" /> -->
    <TrainingTable />
</template>

<script lang="ts">
    import LocalTable from './components/LocalTable.vue';
    import RemoteTable from './components/RemoteTable.vue';
    import TrainingTable from './components/TrainingTable.vue';

    export default {
        name: 'Development',
        components: {
            LocalTable,
            RemoteTable,
            TrainingTable
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