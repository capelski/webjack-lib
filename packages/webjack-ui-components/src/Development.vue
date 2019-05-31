<template>
    <!-- <BasicStrategyTable />
    <LocalTable /> -->
    <RemoteTable serverUrl="http://localhost:3000/api" />
</template>

<script lang="ts">
    import BasicStrategyTable from './components/BasicStrategyTable.vue';
    import LocalTable from './components/LocalTable.vue';
    import RemoteTable from './components/RemoteTable.vue';

    export default {
        name: 'Development',
        components: {
            BasicStrategyTable,
            LocalTable,
            RemoteTable
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