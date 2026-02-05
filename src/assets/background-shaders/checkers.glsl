#version 300 es
precision mediump float;
uniform float time;
uniform vec2 u_resolution;
in vec2 uv;
out vec4 fragColor;

float bayerDither(vec2 coord) {
    coord = mod(floor(coord), 4.0);
    int index = int(coord.x) + int(coord.y) * 4;

    float bayerMatrix[16] = float[](
        1.0,  8.0,  2.0,  10.0,
        12.0, 4.0,  14.0, 6.0,
        3.0,  11.0, 1.0,  9.0,
        15.0, 7.0,  13.0, 5.0
    );

    return bayerMatrix[index] / 16.0;
}

void main() {

    float aspect = u_resolution.x / u_resolution.y;

    // Choose how many tiles you want across the width
    float tilesX = 13.0; // or whatever number you like

    vec2 st;
    st.x = uv.x * tilesX;
    st.y = uv.y * (tilesX / aspect);

    vec2 warp = vec2(
        sin(st.y * 0.5 + time * 1.5) * 0.5, // Warp the grid horizontally
        //sin(st.x * 0.5 + time * 1.5) * 0.5  // Warp the grid vertically
        0.0
    );

    st += warp;

    float checker = mod(floor(st.x) + floor(st.y), 2.0);
    vec3 color = vec3(checker);

    // Apply dithering to the final color
    float ditherThreshold = bayerDither(gl_FragCoord.xy);
    color = step(ditherThreshold, color);

    fragColor = vec4(color, 1.0);
}