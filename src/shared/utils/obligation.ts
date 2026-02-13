// Wrapper class for a function that can be called at some point, but then if it is not earlier, will be called as part of resolving the obligation.

import { AnyFunction } from "../types/misc.types";

// Enforces that a function should be called at some point. 
// TODO: Document.
export class Obligations {
    private funcs = new Map<string, AnyFunction>();
    private completed: string[] = [];

    private nameOfFunc(func: AnyFunction) {
        if(!func.name || func.name == 'anonymous' || func.name == '') {
            return null;
        }
        return func.name;
    }

    constructor(...funcs: AnyFunction[]) {
        funcs.forEach(func => {
            const name = this.nameOfFunc(func);
            if(!name) {
                throw new Error("Cannot initialize Obligation with anonymous functions. Use addObligation instead.");
            }
            this.funcs.set(func.name, func)
        });
    }

    public addObligation(func: AnyFunction, name?: string) {
        const funcName = name ?? this.nameOfFunc(func);
        if(!funcName) throw new Error("Cannot make obligation out of anonymous function. Provide a name to use as the second argument.");
        this.funcs.set(funcName, func);
    }

    public run(name: string, ...args: any[]) {
        const func = this.funcs.get(name);
        if(!func) throw new Error("Cannot run Obligation, function name not found. (Has it been added?)");
        this.completed.push(name);
        return func(args);
    }

    /** Runs any functions that have not yet been called (unresolved obligations) */
    public resolveObligations() {
        for(const [funcName, func] of this.funcs) {
            if(this.completed.includes(funcName)) continue;
            func();
            this.completed.push(funcName);
        }
    }
}