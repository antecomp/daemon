export default `#version 300 es
precision mediump float;

in vec2 uv;
out vec4 outColor;

uniform sampler2D u_texture;
uniform float time;

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
  // Wobble strength and speed
  float freq = 10.0;
  float amp = 0.015;
  float speed = 2.0;

  // Displace UVs with sine waves
  vec2 wobble = vec2(
    sin(uv.y * freq + time * speed),
    cos(uv.x * freq + time * speed)
  );

  vec2 warpedUV = uv + wobble * amp;

  vec4 texColor = texture(u_texture, warpedUV);
  float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  float ditherThreshold = bayerDither(gl_FragCoord.xy);

  texColor = step(ditherThreshold, vec4(vec3(brightness), 1.0));
  outColor = texColor;
}
`