import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import type { Input, Player } from "./types.ts";

const PLAYER_SIZE = 32;
const PLAYER_SPEED = 240;
const STEP_SECONDS = 1 / 60;
const MAX_FRAME_SECONDS = 0.25;

const QUAD_VERTICES = [
  -0.5, -0.5,
  0.5, -0.5,
  -0.5, 0.5,
  -0.5, 0.5,
  0.5, -0.5,
  0.5, 0.5,
];

main();

//
// start here
//

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createInput(): Input {
  const input: Input = { held: new Set<string>() };
  window.addEventListener("keydown", (event) => input.held.add(event.code));
  window.addEventListener("keyup", (event) => input.held.delete(event.code));
  return input;
}

function updatePlayer(player: Player, input: Input, dt: number) {
  let dx = 0;
  let dy = 0;
  if (input.held.has("KeyW")) dy -= 1;
  if (input.held.has("KeyS")) dy += 1;
  if (input.held.has("KeyA")) dx -= 1;
  if (input.held.has("KeyD")) dx += 1;

  const length = Math.hypot(dx, dy) || 1;
  player.dx = (dx / length) * PLAYER_SPEED;
  player.dy = (dy / length) * PLAYER_SPEED;
  player.x += player.dx * dt;
  player.y += player.dy * dt;
}

function main() {
  const canvas = document.querySelector("#gl-canvas") as HTMLCanvasElement;
  // Initialize the GL context
  const gl = canvas.getContext("webgl2");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  const positionUniformLocation = gl.getUniformLocation(program, "u_position");
  const sizeUniformLocation = gl.getUniformLocation(program, "u_size");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_VERTICES), gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
  gl.uniform2f(sizeUniformLocation, PLAYER_SIZE, PLAYER_SIZE);

  const input = createInput();
  const player: Player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 0,
    dy: 0,
  };

  let previousTime = performance.now();
  let accumulator = 0;

  const frame = (now: number) => {
    accumulator += Math.min((now - previousTime) / 1000, MAX_FRAME_SECONDS);
    previousTime = now;

    while (accumulator >= STEP_SECONDS) {
      updatePlayer(player, input, STEP_SECONDS);
      accumulator -= STEP_SECONDS;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(positionUniformLocation, player.x, player.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}
