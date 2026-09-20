#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_position;
uniform vec2 u_size;

void main() {
  vec2 world = a_position * u_size + u_position;
  vec2 clip = world / u_resolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0, 1);
}
