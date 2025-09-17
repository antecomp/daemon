precision highp float;

uniform sampler2D tDiffuse;
uniform float lumaCutoff; // Threshold at which to clamp to black.
uniform vec2 screensize;
uniform float gamma;
uniform int offsetX;
uniform int offsetY;
varying vec2 vUv;

float getDitherThreshold(vec2 coord) {
  coord = floor(mod(coord, 4.0)); // 0-3 wraparound
  int index = int(coord.x) + int(coord.y) * 4; // flatten to array.

  float m[16];
  m[0] = 0.0;  m[1] = 8.0;  m[2] = 2.0;  m[3] = 10.0;
  m[4] = 12.0; m[5] = 4.0;  m[6] = 14.0; m[7] = 6.0;
  m[8] = 3.0;  m[9] = 11.0; m[10] = 1.0; m[11] = 9.0;
  m[12] = 15.0; m[13] = 7.0; m[14] = 13.0; m[15] = 5.0;

  // threshold to 0.0-1.0 range.
  return m[index] / 16.0;
}

float gammaCorrect(float level, float gamma) {
  return pow(level, 1.0 / gamma);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  brightness = gammaCorrect(brightness, gamma);
  float threshold = getDitherThreshold(vUv * screensize + vec2(offsetX, offsetY)); 

  // Clamp shades below some threshold to black
  if(brightness <= lumaCutoff) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  gl_FragColor = vec4(vec3(brightness >= threshold), 1.0);

}