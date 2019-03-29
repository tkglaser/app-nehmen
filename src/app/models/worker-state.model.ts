export const workerStateKey = 'worker-state';

export const enum WorkerMode {
    Idle,
    Downloading,
    Uploading
}

interface WorkerIdle {
    mode: WorkerMode.Idle;
}

interface WorkerBusy {
    mode: WorkerMode.Downloading | WorkerMode.Uploading;
    itemsDone: number;
    itemsPending: number;
}

export type WorkerStatus = WorkerBusy | WorkerIdle;
