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

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
    vec2 st = uv * 5.0;
    float n = noise(st + time * 0.1);
    n += noise(st * 2.0 + time * 0.2) * 0.0001;
    n += noise(st * 4.0 + time * 0.3) * 0.25;

    vec3 color = vec3(n / 5.0);

    // Apply dithering to the final color
    float ditherThreshold = bayerDither(gl_FragCoord.xy);
    color = step(ditherThreshold, color);

    fragColor = vec4(color, 1.0);
}