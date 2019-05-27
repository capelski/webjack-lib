<template>
    <div>
        <BasicStrategyTable />
    </div>
</template>

<script lang="ts">
    import 'toastr/build/toastr.min.css';
    import BasicStrategyTable from './components/BasicStrategyTable.vue';

    export default {
        name: 'App',
        components: {
            BasicStrategyTable
        }
    };
</script>