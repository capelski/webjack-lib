// Important: JQuery must be imported before Bootstrap
import 'expose-loader?$!jquery';

// tslint:disable-next-line:no-submodule-imports
import 'bootstrap/dist/css/bootstrap.min.css';
// tslint:disable-next-line:no-submodule-imports
import 'bootstrap/dist/js/bootstrap';
// tslint:disable-next-line:no-submodule-imports
import 'toastr/build/toastr.min.css';

import vue from 'vue';
import VueApexCharts from 'vue-apexcharts';
import VModal from 'vue-js-modal';

vue.use(VueApexCharts);
vue.use(VModal);
vue.component('apexchart', VueApexCharts);

export * from './components';
export * from './install';
