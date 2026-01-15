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

/** Simple lazy [X, Y, Z] alias for 3D point.
 *  Can convert from this to LumePosition with array.join(' ')... */
export type XYZ = [number, number, number];

export type Coord2D = [number, number];

export type Orientation = Omit<Gimbal, "roll">

export type VLID = `${string}:${string}` // I wish I could make this more robust but whatever

/** "x y z" - coordinates as a string. Used for position prop for lume elements. */ 
export type LumePosition = `${number} ${number} ${number}`