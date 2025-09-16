export default function attachToConsole(thing: any, as: string) {
    (window as any)[as] = thing;
}