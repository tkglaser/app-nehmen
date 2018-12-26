export default {
    input: './dist-sw/tsc-out/main.js',
    output: {
        file: './dist-sw/sync-worker.js',
        format: 'iife'
    }
};
