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
    vec2 st = uv * 25.0; // Scale the UV coordinates to create a finer grid
    vec2 warp = vec2(
        sin(st.y * 0.5 + time * 1.5) * 0.5, // Warp the grid horizontally
        sin(st.x * 0.5 + time * 1.5) * 0.5  // Warp the grid vertically
    );

    st += warp; // Apply the warp to the grid coordinates

    // Create thin grid lines using fract and smoothstep
    vec2 grid = fract(st);
    grid = smoothstep(0.2, 0.03, abs(grid - 0.0005)) - 0.75; // Thin grid lines

    // Combine the grid axes
    float pattern = max(grid.x, grid.y);

    // Create a color gradient based on the grid pattern
    vec3 color = vec3(pattern);

    // Apply dithering to the final color
    float ditherThreshold = bayerDither(gl_FragCoord.xy);
    color = step(ditherThreshold, color);

    fragColor = vec4(color, 1.0);
}