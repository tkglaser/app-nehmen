// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './dist-sw/tsc-out/service-worker/main.js',
    output: {
        file: './dist-sw/sync-worker.js',
        format: 'iife',
        globals: {
            moment: 'moment',
            idb: 'idb',
            dropbox: 'Dropbox',
            'isomorphic-fetch': 'fetch',
            rxjs: 'rxjs',
            'rxjs/operators': 'rxjs.operators'
        }
    },
    external: [
        'moment',
        'idb',
        'dropbox',
        'isomorphic-fetch',
        'rxjs',
        'rxjs/operators'
    ]
    // plugins: [resolve({}), commonjs({})]
};
