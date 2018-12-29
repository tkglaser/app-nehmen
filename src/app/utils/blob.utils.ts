export function blobToString(blob: Blob): Promise<string> {
    return new Promise(resolve => {
        const reader = new FileReader();

        reader.addEventListener('loadend', (e: any) => {
            const text = e.srcElement.result;
            resolve(text);
        });

        reader.readAsText(blob);
    });
}
