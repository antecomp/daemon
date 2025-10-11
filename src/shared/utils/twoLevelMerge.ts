import { mapObject } from "./mapObject";

export default function twoLevelMerge<
    I extends Record<string, (Record<string, any>)>>(
    a: I, 
    b: {[P in keyof I]?: Partial<I[P]>} // What is this god forsaken type
) {
    // Have to do unknown intermediate, which is probably a sign my types are bad
    // please figure this out better
    return mapObject(a, (inner, key) => ({...inner, ...b[key]})) as unknown as I;
}

// this works :)
//console.log(twoLevelMerge({x: {e: 'hi', b: 'bhdfs'}}, {x: {e: 'bye'}}));