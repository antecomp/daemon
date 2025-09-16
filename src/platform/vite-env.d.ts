/// <reference types="vite/client" />

// Handles .mtl, .obj imports as URLs
declare module '*.mtl' {
    const src: string
    export default src
}

declare module '*.obj' {
    const src: string
    export default src
}

// Autoresolve .glsl to string
declare module '*.glsl' {
    const content: string;
    export default content;
}