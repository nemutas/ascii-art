attribute vec2 aUv;
uniform float uTime;
varying vec2 vUv;
varying vec2 vPrivateUv;

void main() {
  vUv = aUv;
  vPrivateUv = uv;
  
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
}