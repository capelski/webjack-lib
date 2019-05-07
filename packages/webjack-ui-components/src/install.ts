import * as components from './components';

const install = (Vue: any, options: any = {}) => {
    for (let key in components) {
        let _key = options.prefix ? options.prefix + key : key
        Vue.component(_key, (components as any)[key])
    }
};

if (typeof window !== 'undefined' && (window as any).Vue) {
    install((window as any).Vue)
}

export {
    install
}