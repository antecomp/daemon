import { GLSL3, Vector3 } from "three";
import { ShaderPass } from "three/examples/jsm/Addons.js";
// TODO: add types for shaders?
const DitherShader = {
    name: "Dither",
    glslVersion: GLSL3,
    uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
		'tintColor': { value: new Vector3(0.0, 0.5, 1.0) }
	},

	vertexShader: /* glsl */`
		// Remove redundant attributes - Three.js injects these automatically

		out vec2 vUv;

		void main() {
			vUv = uv;  // uv is provided by Three.js
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // position provided by Three.js
		}
	`,

	fragmentShader: /* glsl */`
		precision mediump float;

		uniform float opacity;
		uniform sampler2D tDiffuse;
		uniform vec3 tintColor;

		in vec2 vUv;

		//layout(location = 1) out vec4 fragColor;  // Explicit output location

		void main() {
			vec4 texel = texture(tDiffuse, vUv);
			texel.rgb *= tintColor;  // Apply tint
			pc_fragColor = opacity * texel;
		}
	`

}

// Note to self: 
// Look at how effectSobel gets the resolution, 
// use that as a reference for the resolution uniforms here.
export default new ShaderPass(DitherShader);
