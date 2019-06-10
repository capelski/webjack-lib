import 'expose-loader?$!jquery';
import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'toastr/build/toastr.min.css';

import Vue from 'vue';
import Development from './Development.vue';

new Vue({
    el: '#dev-app',
    render: h => h(Development)
});
