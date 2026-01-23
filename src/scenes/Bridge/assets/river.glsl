uniform float time;
uniform sampler2D map;   // <- GLTF base color map
varying vec2 vUv;

// Simple 2D hash
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Value noise: bilinear interpolation of 4 corner hashes
float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x),
               mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;

    for (int i = 0; i < 3; i++) {
        sum += amp * valueNoise(p * freq);
        freq *= 2.0;
        amp *= 0.5;
    }

    return sum;
}
// Little triangle-shaped bump around `center` with width `width`.
// Returns 0 outside the bump, up to 1 at the center.
float tri(float x, float center, float width) {
    float d = abs(x - center);
    float t = 1.0 - d / width;
    return clamp(t, 0.0, 1.0);
}

void main() {
    vec2 uv = vUv;

    // --- noise / shimmer section (same as before) ---

    vec2 riverUV = vec2(
        uv.x * 32.0,
        uv.y * 14.0
    );

    vec2 uv1 = riverUV + vec2( time * 0.30,  time * 0.07);
    vec2 uv2 = riverUV + vec2(-time * 0.18, -time * 0.11);

    float base = fbm(uv1) * 0.6 + fbm(uv2) * 0.4;
    float fine = valueNoise(riverUV * 6.0 + vec2(time * 0.6, -time * 0.4));

    float n = mix(base, fine, 0.4);
    n = clamp(n, 0.0, 1.0);

    float p1 = tri(n, 0.20, 0.10);
    float p2 = tri(n, 0.48, 0.18);
    float p3 = tri(n, 0.78, 0.16);

    float bands = 0.10 * p1 + 0.32 * p2 + 0.48 * p3;

    float brightness = 0.00 + bands;
    brightness += (fine - 0.5) * 0.05;
    brightness = clamp(brightness, 0.0, 1.0);

    // --- sample GLTF texture and combine ---

    vec4 baseColor = texture2D(map, vUv);

    // Option A: shimmer as brightness multiplier
    // Keeps color hue from the texture, but modulates value.
    float minMul = 0.1;   // darkest multiplier
    float maxMul = 2.5;   // brightest multiplier
    float mul    = mix(minMul, maxMul, brightness);

    vec3 finalColor = baseColor.rgb * mul;

    gl_FragColor = vec4(finalColor, baseColor.a);
}
