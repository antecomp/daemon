#version 300 es
precision mediump float;

uniform float time;
uniform sampler2D u_texture;

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
    // Calculate time-based blend factor (oscillates 0..1)
    float t = 0.5 + 0.5 * sin(time);

    // Texture coordinates for each half
    vec2 uvLeft = vec2(uv.x * 0.5, uv.y);
    vec2 uvRight = vec2(uv.x * 0.5 + 0.5, uv.y);

    // Sample both halves
    vec3 colorLeft = texture(u_texture, uvLeft).rgb;
    vec3 colorRight = texture(u_texture, uvRight).rgb;

    // Crossfade
    vec3 blended = mix(colorLeft, colorRight, t);
    if(blended.r < 0.05) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Apply dithering to final color
    float ditherThreshold = bayerDither(gl_FragCoord.xy);
    vec3 finalColor = step(ditherThreshold, blended);

    fragColor = vec4(finalColor, 1.0);
}