precision highp float;

uniform sampler2D tDiffuse;
uniform float lumaCutoff; // Threshold at which to clamp to black.
uniform vec2 screensize;
uniform float gamma;      // Use 2.2 to match sRGB-ish Hard Mix.
uniform int offsetX;
uniform int offsetY;
varying vec2 vUv;

// 4x4 Bayer pattern in [0,1]
float getDitherPattern(vec2 coord) {
    coord = floor(mod(coord, 4.0)); // 0..3 wraparound
    int index = int(coord.x) + int(coord.y) * 4;

    float m[16];
    m[0]  = 0.0;  m[1]  = 8.0;  m[2]  = 2.0;  m[3]  = 10.0;
    m[4]  = 12.0; m[5]  = 4.0;  m[6]  = 14.0; m[7]  = 6.0;
    m[8]  = 3.0;  m[9]  = 11.0; m[10] = 1.0;  m[11] = 9.0;
    m[12] = 15.0; m[13] = 7.0;  m[14] = 13.0; m[15] = 5.0;

    // 0..1. You can tweak this to match your Bayer PNG if needed.
    return (m[index] + 0.5) / 16.0;
}

// Optional helper if you still want gamma-based luma for cutoff
float gammaEncode(float linear, float gamma) {
    return pow(linear, 1.0 / gamma);
}

void main() {
    // 1. Sample scene color in linear space (Three.js post-process default).
    vec3 colorLinear = texture2D(tDiffuse, vUv).rgb;

    // 2. Compute brightness for cutoff. We can approximate sRGB luma by
    //    encoding to gamma first, then dot with luma weights.
    vec3 colorGamma = pow(colorLinear, vec3(1.0 / gamma));
    float brightness = dot(colorGamma, vec3(0.299, 0.587, 0.114));

    // Clamp shades below some threshold to black (in a "perceptual" sense).
    if (brightness <= lumaCutoff) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // 3. Screen-space Bayer pattern
    vec2 pixelCoord = vUv * screensize + vec2(float(offsetX), float(offsetY));
    float pattern = getDitherPattern(pixelCoord); // 0..1

    // 4. Compute linear-space threshold equivalent to:
    //    Hard Mix in gamma space: pow(colorLinear, 1/gamma) + pattern >= 1
    float thresholdLinear = pow(max(0.0, 1.0 - pattern), gamma);

    // 5. Per-channel comparison in linear space
    vec3 outLinear = step(vec3(thresholdLinear), colorLinear);

    gl_FragColor = vec4(outLinear, 1.0);
}
