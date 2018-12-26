export default {
    input: './dist-sw/tsc-out/service-worker/main.js',
    output: {
        file: './dist-sw/sync-worker.js',
        format: 'iife'
    }
};
