#version 300 es

in vec2 a_position;
in vec4 a_instance;

uniform vec2 u_resolution;
uniform vec2 u_size;
uniform vec2 u_uvSize;

out vec2 v_uv;

void main() {
  vec2 world = a_position * u_size + a_instance.xy;
  vec2 clip = world / u_resolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0, 1);
  v_uv = a_instance.zw + (a_position + 0.5) * u_uvSize;
}
