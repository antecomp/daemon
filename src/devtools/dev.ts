const SHOULD_ALSO_PRINT = true;

let logs: { location: string, message: any }[] = [];

function log(what: any, print = true) {
    //if(SHOULD_ALSO_PRINT_LOG) console.log(what);
    const stack = new Error().stack;

    // Parse the stack string (index 2 is usually the caller)
    const stackLines = stack?.split('\n') ?? "";
    const callerLine = stackLines[2] || "";

    const location = callerLine.trim().replace(/at /g, "");

    logs.push({
        location: location,
        message: what
    });

    if(SHOULD_ALSO_PRINT && print) {
        console.log(what, `(at ${location})`);
    }
}

export const DGDEV = {
    log,
    logs() {
        logs.forEach((l, i) => {
            console.log(i, l.message, l.location);
        })
    },
    attach
};

function attach(what: any, as: string) {
    log(`Attached ${as} to DG devtools`, false);
    (DGDEV as Record<string, any>)[as] = what;
}

(() => (window as any)['DG'] = DGDEV)();