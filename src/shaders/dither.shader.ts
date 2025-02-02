import { ShaderPass } from "three/examples/jsm/Addons.js";
// TODO: add types for shaders?
const DitherShader = {
    uniforms: {
        
    }
}

// Note to self: 
// Look at how effectSobel gets the resolution, 
// use that as a reference for the resolution uniforms here.
export default new ShaderPass(DitherShader);