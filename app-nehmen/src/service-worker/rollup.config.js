// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './dist-sw/tsc-out/service-worker/main.js',
    output: {
        file: './dist-sw/sync-worker.js',
        format: 'iife',
        globals: { moment: 'moment', idb: 'self.idb' }
    },
    external: ['moment', 'idb']
    // plugins: [resolve({}), commonjs({})]
};
