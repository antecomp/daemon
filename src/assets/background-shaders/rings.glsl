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
         1.0,  8.0,  2.0, 10.0,
        12.0,  4.0, 14.0,  6.0,
         3.0, 11.0,  1.0,  9.0,
        15.0,  7.0, 13.0,  5.0
    );

    return bayerMatrix[index] / 16.0;
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;

    // Center UVs and fix aspect so circles stay circular
    vec2 p = uv - vec2(0.5);
    p.x *= aspect;

    float dist = length(p);

    // Ring parameters
    float speed     = 0.05;   // how fast rings move out
    float spacing   = 0.15;  // distance between rings
    float thickness = 0.04;  // thickness of the ring line

    // Animate radius over time
    float t = time * speed;

    // Compute a repeating ramp as distance grows:
    // (dist - t) / spacing -> increases with dist, 1.0 per ring
    // fract(...) → wraps 0..1 per ring
    float v = fract((dist - t) / spacing);

    // Distance to the nearest ring center (at v = 0 or v = 1)
    float d = min(v, 1.0 - v);

    // Turn that into a thin line using smoothstep
    float ring = 1.0 - smoothstep(0.0, thickness, d);

    // Fade out as rings get large
    float maxRadius = 0.9;
    float fade = 1.0 - smoothstep(0.0, maxRadius, dist);

    float intensity = ring * fade;

    vec3 color = vec3(intensity);

    float ditherThreshold = bayerDither(gl_FragCoord.xy);
    color = step(ditherThreshold, color);

    fragColor = vec4(color, 1.0);
}