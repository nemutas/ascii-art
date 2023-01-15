uniform sampler2D tImage;
uniform vec2 uCoveredScale;
uniform sampler2D tAsciiMap;
uniform float uAsciiMapSize;
uniform vec2 uCellSize;
uniform float uTime;
varying vec2 vPrivateUv;
varying vec2 vUv;

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float getAscii(vec3 color) {
  float gray = luma(color);
  float r = rand(vUv + uTime) * 0.02;
  float asciiUv = 1.0 - floor((gray + r) * uAsciiMapSize) / uAsciiMapSize;
  float asciiCellSize = 1.0 / uAsciiMapSize;
  float ascii = texture2D(tAsciiMap, vec2(asciiUv + vPrivateUv.x * asciiCellSize, vPrivateUv.y)).a;
  return ascii;
}

void main() {
  vec2 uv = (vUv - 0.5) * uCoveredScale + 0.5;
  vec2 pUv = (vPrivateUv - 0.5) * uCoveredScale + 0.5;
  vec4 highDiffuse = texture2D(tImage, uv + pUv * uCellSize);
  vec4 lowDiffuse = texture2D(tImage, uv);
  float gray = luma(lowDiffuse.rgb);

  float ascii = getAscii(lowDiffuse.rgb);

  vec3 color = mix(vec3(ascii), vec3(gray) * 0.8 + vec3(ascii) * 0.5, step(0.5, uv.x));

  gl_FragColor = vec4(color, 1.0);
}