const vortexShader = `
    #version 300 es
        precision mediump float;
        uniform float time;
        in vec2 uv;
        out vec4 fragColor;

        float bayerDither(vec2 coord) {
            coord = mod(floor(coord), 4.0);
            int index = int(coord.x) + int(coord.y) * 4;

            float bayerMatrix[16] = float[](
                0.0,  8.0,  2.0,  10.0,
                12.0, 4.0,  14.0, 6.0,
                3.0,  11.0, 1.0,  9.0,
                15.0, 7.0,  13.0, 5.0
            );

            return bayerMatrix[index] / 16.0;
        }

        void main() {
            vec2 p = uv - vec2(0.5);
            float len = length(p);
            float angle = atan(p.y, p.x) + sin(len * 10.0 - time * 2.0) * 0.3;

            vec3 color = vec3(
            0.25 * sin(angle * 5.0 + time),
            0.25 * sin(angle * 5.0 + time),
            0.25 * sin(angle * 5.0 + time)
            );

            // Apply dithering to the final color
            float ditherThreshold = bayerDither(gl_FragCoord.xy);
            color = step(ditherThreshold, color); // Threshold color based on dither value

            fragColor = vec4(color, 1.0);
    }
`

export default vortexShader;