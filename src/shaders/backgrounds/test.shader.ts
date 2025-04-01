export default `#version 300 es
precision mediump float;

in vec2 uv;
out vec4 outColor;

uniform sampler2D u_texture;
uniform float time;
uniform vec2 u_resolution;

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

vec2 rotateUV(vec2 uv, float angle, vec2 aspect) {
    // Move the origin to the center (from [0,1] to [-0.5,0.5])
    uv -= 0.5;

    // Scale Y to match X, so we rotate in a square space
    uv *= vec2(1.0, aspect.x / aspect.y);

    // Apply rotation matrix
    float s = sin(angle);
    float c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);
    uv = rot * uv;

    // Undo the Y scale
    //uv *= vec2(1.0, aspect.x / aspect.y);

    // Move origin back
    uv += 0.5;

    return uv;
}


void main() {
  float aspectCorrection = u_resolution.x / u_resolution.y;
  
  // Center UVs and apply aspect correction
  vec2 centeredUV = uv - 0.5;
  centeredUV.x *= aspectCorrection;
  
  // Apply rotation
  float angle = time; // Time in radians
  mat2 rot = mat2(
      cos(angle), -sin(angle),
      sin(angle),  cos(angle)
  );
  vec2 rotatedUV = rot * centeredUV;
  
  // Undo aspect correction and recenter
  //rotatedUV.x /= aspectCorrection;
  rotatedUV += 0.5;
  vec2 clampedUV = clamp(rotatedUV, 0.0, 1.0);

  vec4 texColor = texture(u_texture, clampedUV);
  float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114)) * (abs(sin(time * 0.2) + 0.1));
  float ditherThreshold = bayerDither(gl_FragCoord.xy);

  texColor = step(ditherThreshold, vec4(vec3(brightness), 1.0));
  outColor = texColor;
}
`