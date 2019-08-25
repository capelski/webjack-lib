// Important: JQuery must be imported before Bootstrap
import 'expose-loader?$!jquery';

// tslint:disable-next-line:no-submodule-imports
import 'bootstrap/dist/css/bootstrap.min.css';
// tslint:disable-next-line:no-submodule-imports
import 'bootstrap/dist/js/bootstrap';
// tslint:disable-next-line:no-submodule-imports
import 'toastr/build/toastr.min.css';

import Vue from 'vue';
import VueApexCharts from 'vue-apexcharts';
import VModal from 'vue-js-modal';
import Development from './Development.vue';

Vue.use(VueApexCharts);
Vue.use(VModal);

Vue.component('apexchart', VueApexCharts);

// tslint:disable-next-line:no-unused-expression
new Vue({
    el: '#dev-app',
    render: h => h(Development)
});
