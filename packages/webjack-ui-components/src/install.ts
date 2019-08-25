import * as components from './components';

const install = (vue: any, options: any = {}) => {
    // tslint:disable-next-line:forin
    for (const key in components) {
        const _key = options.prefix ? options.prefix + key : key;
        vue.component(_key, components[key]);
    }
};

if (typeof window !== 'undefined' && (window as any).Vue) {
    install((window as any).Vue);
}

export { install };
