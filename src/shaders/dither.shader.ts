import { Vector2 } from "three";
import { ShaderPass } from "three/examples/jsm/Addons.js";

const DitherShader = {
	uniforms: {
		tDiffuse: {value: null}, // Input texture
		// Will likely need to change this to scenes client size/window size, for proper scaling
		screenSize: {value: new Vector2(window.innerWidth, window.innerHeight)},
		cameraRotation: {value: 0.0},
		cameraFov: {value: Math.PI / 4},
		opacity: { value: 1.0 }
	},

	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,

	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform vec2 screenSize;
		uniform float cameraRotation;
		uniform float cameraFov;

		varying vec2 vUv;

		float bayerDither(vec2 coord) {
			// Scale down the coordinates for better range
			coord = floor(mod(coord, 4.0));  // Ensure coordinates stay within 0-3 range

			// Basic 4x4 Bayer matrix thresholds
			float bayerMatrix[16];
			bayerMatrix[0] = 0.0;  bayerMatrix[1] = 8.0;  bayerMatrix[2] = 2.0;  bayerMatrix[3] = 10.0;
			bayerMatrix[4] = 12.0; bayerMatrix[5] = 4.0;  bayerMatrix[6] = 14.0; bayerMatrix[7] = 6.0;
			bayerMatrix[8] = 3.0;  bayerMatrix[9] = 11.0; bayerMatrix[10] = 1.0; bayerMatrix[11] = 9.0;
			bayerMatrix[12] = 15.0; bayerMatrix[13] = 7.0; bayerMatrix[14] = 13.0; bayerMatrix[15] = 5.0;

			// Flatten 2D index to access Bayer matrix
			int index = int(coord.x) + int(coord.y) * 4;

			// Normalize threshold to 0.0 - 1.0 range
			return bayerMatrix[index] / 16.0;
		}

	void main() {
		// Calculate aspect ratio
    float aspectRatio = screenSize.x / screenSize.y;

    // Normalize camera rotation to FOV units
    float normalizedRotation = cameraRotation / cameraFov;

    // Adjust dither offset with aspect ratio correction
    vec2 ditherOffset = vec2(
        (screenSize.x * normalizedRotation) / (2.0 * 3.141592653589793 * aspectRatio),
        (screenSize.y * normalizedRotation) / (2.0 * 3.141592653589793)
    );

    // Apply dither offset to UVs
    vec2 ditherCoord = mod((vUv * screenSize + ditherOffset), 4.0);

		// For debugging: Visualize the dither coordinates
		gl_FragColor = vec4(ditherCoord.x / 4.0, ditherCoord.y / 4.0, 0.0, 1.0);

		// Apply the actual dithering effect
		float ditherValue = bayerDither(ditherCoord);

		// Sample the original color from the scene
		vec4 color = texture2D(tDiffuse, vUv);
		float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));  // Convert to grayscale

		// Uncomment this to apply the dithering
		gl_FragColor = (brightness <= ditherValue) ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(1.0, 1.0, 1.0, 1.0);
		}
	`
}


// Note to self: 
// Look at how effectSobel gets the resolution, 
// use that as a reference for the resolution uniforms here.
export default DitherShader;
