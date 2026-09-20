import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import type { Player } from "./types.ts";

const PLAYER_SIZE = 32;

const QUAD_VERTICES = [
  -0.5, -0.5,
  0.5, -0.5,
  -0.5, 0.5,
  -0.5, 0.5,
  0.5, -0.5,
  0.5, 0.5,
];

export type Renderer = {
  gl: WebGL2RenderingContext;
  positionUniformLocation: WebGLUniformLocation;
};

function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("createShader failed");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  const log = gl.getShaderInfoLog(shader);
  gl.deleteShader(shader);
  throw new Error(`shader compile failed: ${log}`);
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram();
  if (program === null) {
    throw new Error("createProgram failed");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }

  const log = gl.getProgramInfoLog(program);
  gl.deleteProgram(program);
  throw new Error(`program link failed: ${log}`);
}

function getUniformLocation(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);
  if (location === null) {
    throw new Error(`missing uniform ${name}`);
  }

  return location;
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext("webgl2");
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    throw new Error("webgl2 is not available");
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = getUniformLocation(gl, program, "u_resolution");
  const positionUniformLocation = getUniformLocation(gl, program, "u_position");
  const sizeUniformLocation = getUniformLocation(gl, program, "u_size");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_VERTICES), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
  gl.uniform2f(sizeUniformLocation, PLAYER_SIZE, PLAYER_SIZE);

  return { gl, positionUniformLocation };
}

export function render(renderer: Renderer, player: Player) {
  const { gl, positionUniformLocation } = renderer;

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(positionUniformLocation, player.x, player.y);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
