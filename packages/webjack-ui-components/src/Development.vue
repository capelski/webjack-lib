<template>
    <!-- <AjaxTable serverUrl="http://localhost:3000/api" /> -->
    <!-- <LocalTable /> -->
    <TrainingTable />
</template>

<script lang="ts">
    import AjaxTable from './components/AjaxTable.vue';
    import LocalTable from './components/LocalTable.vue';
    import TrainingTable from './components/TrainingTable.vue';

    export default {
        name: 'Development',
        components: {
            AjaxTable,
            LocalTable,
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