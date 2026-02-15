import { AnyFunction, SuggestedString } from "../types/misc.types";

type ObligationFunctions = Record<string, AnyFunction>;
type KnownObligationName<TFuncs extends ObligationFunctions> = Extract<keyof TFuncs, string>;

/**
 * Tracks named functions that should each be executed at least once.
 *
 * A function may be executed explicitly with {@link run}, or implicitly during
 * {@link resolveObligations} if it has not yet been executed.
 */
export class Obligations<TFuncs extends ObligationFunctions = ObligationFunctions> {
    private funcs = new Map<string, AnyFunction>();
    private completed = new Set<string>();

    /**
     * Resolves a function's usable name.
     *
     * @param func Function to inspect.
     * @returns Function name when available; otherwise `null`.
     */
    private nameOfFunc(func: AnyFunction): string | null {
        if(!func.name || func.name == 'anonymous' || func.name == '') {
            return null;
        }
        return func.name;
    }

    /**
     * Creates a new obligations collection from named functions.
     *
     * @param funcs Functions to register by their declared names.
     */
    constructor(funcs?: TFuncs) {
        if(!funcs) return;
        for(const [funcName, func] of Object.entries(funcs)) {
            this.funcs.set(funcName, func);
        }
    }

    /**
     * Adds a required function to the collection.
     *
     * @param func Function to register.
     * @param name Optional explicit key; required for anonymous functions.
     * @throws Error When the function is anonymous and no name is provided.
     */
    public setObligation(func: AnyFunction, name?: string): void {
        const funcName = name ?? this.nameOfFunc(func);
        if(!funcName) throw new Error("Cannot make obligation out of anonymous function. Provide a name to use as the second argument.");
        this.funcs.set(funcName, func);
    }

    /**
     * Executes one registered function and marks it as completed.
     *
     * @param name Registered function name.
     * @param args Arguments passed to the function.
     * @returns The target function's return value.
     * @throws Error When no function exists for `name`.
     */
    public run<K extends KnownObligationName<TFuncs>>(name: K, ...args: Parameters<TFuncs[K]>): ReturnType<TFuncs[K]>;
    public run(name: SuggestedString<KnownObligationName<TFuncs>>, ...args: any[]): any;
    public run(name: string, ...args: any[]): any {
        const func = this.funcs.get(name);
        if(!func) throw new Error("Cannot run Obligation, function name not found. (Has it been added?)");
        this.completed.add(name);
        return func(...args);
    }

    /**
     * Executes all remaining unresolved functions and marks them as completed.
     */
    public resolveObligations(): void {
        for(const [funcName, func] of this.funcs) {
            if(this.completed.has(funcName)) continue;
            func();
            this.completed.add(funcName);
        }
    }

    /**
     * Check if an obligation has already been resolved.
     */
    public isObligationResolved(name: SuggestedString<KnownObligationName<TFuncs>>) {
        if (!this.funcs.has(name)) throw new Error("Cannot check obligation that does not exist! (Has been added)");
        return this.completed.has(name);
    }
}