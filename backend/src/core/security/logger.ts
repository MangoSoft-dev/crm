

export class console {
    static log(key: string, route: string, ...args: any[]) {
        global.console.group(`[DEBUG] key: ${key} - route: ${route}`);
        if (args.length > 0) {
            global.console.log('Params:');
            args.forEach((arg, i) => global.console.dir(arg, { depth: null }));
        }
        global.console.groupEnd();
        global.console.log('******************************************************');
    }
    static error(key: string, route: string, exc: any) {
        console.log('ERROR***: ', key, route, exc)
    }
}