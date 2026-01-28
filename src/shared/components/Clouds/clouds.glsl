uniform float time;
varying vec2 vUv;

// Classic 2D value noise
float hash(vec2 p) {
    return fract(sin(dot(p ,vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0 - 2.0*f);
    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b)* u.x * u.y;
}

// Fake flow field function distort UVs using moving noise
vec2 flow(vec2 uv, float t) {
    float angle = noise(uv * 1.5 + t * 0.05) * 6.28;
    return uv + vec2(cos(angle), sin(angle)) * 0.01;
}

void main() {
    vec2 uv = vUv;

    uv *= 2.0; // scaleeeeeeee

    // Simulate river flow distortion
    uv = flow(uv, time);
    uv += vec2(time * 0.03, 0.0);  // directional drift rightward

    float n = noise(uv * 8.0);
    float shimmer = noise(uv * 40.0 + time * 1.5); // fast small sparkle

    // Combine base + highlights
    vec3 waterColor = mix(vec3(0.0, 0.0, 0.0), vec3(0.8, 0.8, 0.8), n);
    waterColor += shimmer * 0.1;

    // Subtle depth fade thingy
    //waterColor *= 0.8 + 0.2 * (1.0 - vUv.y);

    // kjasdhj
    //waterColor += vUv.x / 4.0; // Lazily making it brighter at the top (moon location)
    waterColor -= 0.1;

    float dist = length(vUv - vec2(0.5));  // radial distance from center
    float falloff = dist * 2.0;           // rate is your chosen decrease amount
    waterColor = waterColor - falloff;

    

    gl_FragColor = vec4(vec3(waterColor), 0.95); // Semi-transparent

    
}