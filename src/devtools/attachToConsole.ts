/** Simple helper to attach something to the console (as in, make it a property of `window` so it can be accessed from devtools) */
export default function attachToConsole(thing: any, as: string) {
    (window as any)[as] = thing;
}