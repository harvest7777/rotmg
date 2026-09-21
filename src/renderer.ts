import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import type { Player } from "./types.ts";
import { SPRITE_SIZE, characterFrame, type Spritesheet } from "./sprites.ts";

const SPRITE_SCALE = 6;
const INSTANCE_FLOATS = 5;
const INSTANCE_STRIDE = INSTANCE_FLOATS * 4;
const SPRITE_DRAW_SIZE = SPRITE_SIZE * SPRITE_SCALE;

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
  instanceBuffer: WebGLBuffer;
  instanceData: Float32Array;
  spritesheet: Spritesheet;
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

export function createRenderer(
  canvas: HTMLCanvasElement,
  spritesheet: Spritesheet,
): Renderer {
  const gl = canvas.getContext("webgl2", { antialias: false });
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
  const instanceAttributeLocation = gl.getAttribLocation(program, "a_instance");
  const flipAttributeLocation = gl.getAttribLocation(program, "a_flip");
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  const sizeUniformLocation = gl.getUniformLocation(program, "u_size");
  const uvSizeUniformLocation = gl.getUniformLocation(program, "u_uvSize");
  const atlasUniformLocation = gl.getUniformLocation(program, "u_atlas");

  if (
    positionAttributeLocation === -1 ||
    instanceAttributeLocation === -1 ||
    flipAttributeLocation === -1 ||
    resolutionUniformLocation === null ||
    sizeUniformLocation === null ||
    uvSizeUniformLocation === null ||
    atlasUniformLocation === null
  ) {
    throw new Error("shader is missing an expected attribute or uniform");
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_VERTICES), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  const instanceData = new Float32Array(INSTANCE_FLOATS);
  const instanceBuffer = gl.createBuffer();
  if (instanceBuffer === null) {
    throw new Error("createBuffer failed");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, instanceData.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(instanceAttributeLocation);
  gl.vertexAttribPointer(instanceAttributeLocation, 4, gl.FLOAT, false, INSTANCE_STRIDE, 0);
  gl.vertexAttribDivisor(instanceAttributeLocation, 1);
  gl.enableVertexAttribArray(flipAttributeLocation);
  gl.vertexAttribPointer(flipAttributeLocation, 1, gl.FLOAT, false, INSTANCE_STRIDE, 16);
  gl.vertexAttribDivisor(flipAttributeLocation, 1);

  const texture = gl.createTexture();
  if (texture === null) {
    throw new Error("createTexture failed");
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    spritesheet.image,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
  gl.uniform2f(sizeUniformLocation, SPRITE_DRAW_SIZE, SPRITE_DRAW_SIZE);
  gl.uniform2f(uvSizeUniformLocation, spritesheet.uvWidth, spritesheet.uvHeight);
  gl.uniform1i(atlasUniformLocation, 0);

  return { gl, instanceBuffer, instanceData, spritesheet };
}

export function render(renderer: Renderer, player: Player, alpha: number) {
  const { gl, instanceBuffer, instanceData, spritesheet } = renderer;

  const frame = characterFrame(spritesheet, player);

  instanceData[0] = player.prevX + (player.x - player.prevX) * alpha;
  instanceData[1] = player.prevY + (player.y - player.prevY) * alpha;
  instanceData[2] = frame.column * spritesheet.uvWidth;
  instanceData[3] = frame.row * spritesheet.uvHeight;
  instanceData[4] = frame.mirrored ? -1 : 1;

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceData);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1);
}
