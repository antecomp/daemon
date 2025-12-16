precision highp float;

uniform sampler2D tDiffuse;
uniform float lumaCutoff;  // cutoff in a perceptual sense
uniform vec2 screensize;
uniform int offsetX;
uniform int offsetY;
varying vec2 vUv;

// --- sRGB helpers (Khronos / IEC spec style) ---
vec3 linearToSRGB(vec3 c) {
    vec3 cutoff = vec3(0.0031308);
    vec3 low  = c * 12.92;
    vec3 high = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
    return mix(high, low, lessThanEqual(c, cutoff));
}

vec3 sRGBToLinear(vec3 c) {
    vec3 cutoff = vec3(0.04045);
    vec3 low  = c / 12.92;
    vec3 high = pow((c + 0.055) / 1.055, vec3(2.4));
    return mix(high, low, lessThanEqual(c, cutoff));
}

// GIMP Bayer
float getBayerPattern(vec2 coord) {
    coord = floor(mod(coord, 4.0)); // 0..3 wrap
    int index = int(coord.x) + int(coord.y) * 4;

    // GIMP 4x4 Bayer in sRGB (0..1), from:
    // 08 87 28 A7
    // C7 48 E7 68
    // 38 B7 18 97
    // F7 78 D7 58
    float m[16];
    m[0]  = 8.0  / 255.0;  // 0x08
    m[1]  = 135.0/255.0;   // 0x87
    m[2]  = 40.0 / 255.0;  // 0x28
    m[3]  = 167.0/255.0;   // 0xA7

    m[4]  = 199.0/255.0;   // 0xC7
    m[5]  = 72.0 /255.0;   // 0x48
    m[6]  = 231.0/255.0;   // 0xE7
    m[7]  = 104.0/255.0;   // 0x68

    m[8]  = 56.0 /255.0;   // 0x38
    m[9]  = 183.0/255.0;   // 0xB7
    m[10] = 24.0 /255.0;   // 0x18
    m[11] = 151.0/255.0;   // 0x97

    m[12] = 247.0/255.0;   // 0xF7
    m[13] = 120.0/255.0;   // 0x78
    m[14] = 215.0/255.0;   // 0xD7
    m[15] = 88.0 /255.0;   // 0x58

    return m[index];
}


void main() {
    // 1. Sample scene color in linear space (Three.js post-process)
    vec3 colorLinear = texture2D(tDiffuse, vUv).rgb;

    // 2. Convert to true sRGB for Photoshop-style operations
    vec3 colorSRGB = linearToSRGB(colorLinear);

    // 3. Luma for cutoff in sRGB space (matches perceptual brightness better)
    float brightness = dot(colorSRGB, vec3(0.299, 0.587, 0.114));
    if (brightness <= lumaCutoff) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // 4. Screen-space Bayer pattern
    vec2 pixelCoord = vUv * screensize + vec2(float(offsetX), float(offsetY));
    float pattern = getBayerPattern(pixelCoord);

    // 5. Hard Mix on luminance in sRGB so the final color is strictly black or white
    float mono = step(1.0, brightness + pattern);
    vec3 outSRGB = vec3(mono);

    // vec3 outSRGB = step(vec3(1.0), colorSRGB + vec3(pattern)); // if we instead want to threshold colours.

    // 6. Convert back to linear so renderer outputColorSpace can do its job
    vec3 outLinear = sRGBToLinear(outSRGB);

    gl_FragColor = vec4(outSRGB, 1.0);
}
