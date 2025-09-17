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

declare module '*.fbx' {
    const src: string
    export default src
}

// if you add more asset modules, make sure you also add them to assetsInclude in vite.config.ts 

// Autoresolve .glsl to string
declare module '*.glsl' {
    const content: string;
    export default content;
}