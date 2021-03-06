const charsToEncode = /[\u007f-\uffff]/g;

// This function is simple and has OK performance compared to more
// complicated ones: http://jsperf.com/json-escape-unicode/4
export function httpHeaderSafeJSON(v: any) {
    return JSON.stringify(v).replace(
        charsToEncode,
        c => '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4)
    );
}
