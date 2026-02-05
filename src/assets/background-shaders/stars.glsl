#version 300 es
precision mediump float;

uniform float time;
in vec2 uv;
out vec4 fragColor;

// Simple hash for pseudo-randomness
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

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

// Computes contribution of stars in a grid
float starLayer(vec2 p, float density, float flickerSpeed, float size) {
    // Work in "grid space" for this layer
    vec2 g = p * density;

    // Base integer cell
    vec2 baseCell = floor(g);

    float brightness = 0.0;

    // Look at stars in a 3x3 neighborhood of cells
    for (int jy = -1; jy <= 1; ++jy) {
        for (int ix = -1; ix <= 1; ++ix) {
            vec2 cell = baseCell + vec2(float(ix), float(jy));

            // One random star per cell
            float h1 = hash(cell);
            float h2 = hash(cell + 13.37);
            vec2 starOffset = vec2(h1, h2);   // position inside cell in [0,1)^2
            vec2 starPos = cell + starOffset; // position in grid space

            // Distance from pixel to this star (in grid units)
            float d = length(g - starPos);

            // Soft radial falloff
            float starShape = smoothstep(size, 0.0, d);

            // Random base brightness
            float base = hash(cell + 7.21);

            // Make stars sparse by threshold
            float mask = step(0.86, base);

            // Flicker with random phase
            float phase   = hash(cell + 99.9) * 6.28318;
            float flicker = 0.5 + 0.5 * sin(time * flickerSpeed + phase);

            brightness += starShape * base * flicker * mask;
        }
    }

    return brightness;
}

void main() {
    // Center uv for nicer composition
    vec2 p = (uv - 0.5) * 2.0;

    // Slow drift
    p.x += 0.03 * time;

    // Two layers of stars
    float stars = 0.0;
    stars += starLayer(p, 10.0, 4.0, 0.20);   // smaller stars, more dense
    stars += starLayer(p * 0.6, 7.0, 2.2, 0.28); // slightly bigger, slower

    // Optional: tone down a bit
    stars = clamp(stars, 0.0, 1.0);

    vec3 color = vec3(stars); // grayscale starfield

    float ditherThreshold = bayerDither(gl_FragCoord.xy);
    color = step(ditherThreshold, color);

    fragColor = vec4(color, 1.0);
}
