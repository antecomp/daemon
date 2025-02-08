const CopyShader = {

	name: 'CopyShader',

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }
	},

	vertexShader: /* glsl */`
		#version 300 es
		in vec3 position;
		in vec2 uv;

		out vec2 vUv;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,

	fragmentShader: /* glsl */`
		#version 300 es
		precision mediump float;

		uniform float opacity;
		uniform sampler2D tDiffuse;

		in vec2 vUv;
		out vec4 fragColor;

		void main() {
			vec4 texel = texture(tDiffuse, vUv); // texture2D is deprecated, use texture()
			fragColor = opacity * texel;
            fragColor.r = 0;
		}
	`

};

export { CopyShader };
