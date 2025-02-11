export interface coordinatePair {
    x1: number,
    x2: number,
    y1: number,
    y2: number
}

export interface Point {
    x: number,
    y: number
}

export interface Point3D {
    x: number,
    y: number,
    z: number
}

export interface Gimbal {
    pitch: number
    roll: number
    yaw: number
}

export interface AssArray<T> { // Associative Array / Dictionary. I have the humour of a child.
    [key: string]: T
}

export type VLID = `${string}:${string}` // I wish I could make this more robust but whatever

/**
 * "x y z" - coordinates as a string. Used for position prop for lume elements.
 */
export type LumePosition = `${number} ${number} ${number}`

export type Point3DTuple = [number, number, number]; // Can convert from this to LumePosition with array.join(' ')...