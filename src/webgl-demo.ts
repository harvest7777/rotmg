import { createDebug, updateDebug } from "./debug.ts";
import { createInput, isActive } from "./input.ts";
import { createRenderer, render } from "./renderer.ts";
import type { Input, Player } from "./types.ts";

const PLAYER_SPEED = 240;
const STEP_SECONDS = 1 / 60;
const MAX_FRAME_SECONDS = 0.25;

main();

function updatePlayer(player: Player, input: Input, dt: number) {
  player.prevX = player.x;
  player.prevY = player.y;

  let dx = 0;
  let dy = 0;
  if (isActive(input, "moveUp")) dy -= 1;
  if (isActive(input, "moveDown")) dy += 1;
  if (isActive(input, "moveLeft")) dx -= 1;
  if (isActive(input, "moveRight")) dx += 1;

  const length = Math.hypot(dx, dy) || 1;
  player.x += (dx / length) * PLAYER_SPEED * dt;
  player.y += (dy / length) * PLAYER_SPEED * dt;
}

function main() {
  const canvas = document.querySelector("#gl-canvas") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  const input = createInput();
  const debug = createDebug();
  const player: Player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    prevX: canvas.width / 2,
    prevY: canvas.height / 2,
  };

  let previousTime = performance.now();
  let accumulator = 0;

  const frame = (now: number) => {
    const intervalMs = now - previousTime;
    const workStartMs = performance.now();

    accumulator += Math.min(intervalMs / 1000, MAX_FRAME_SECONDS);
    previousTime = now;

    while (accumulator >= STEP_SECONDS) {
      updatePlayer(player, input, STEP_SECONDS);
      accumulator -= STEP_SECONDS;
    }

    render(renderer, player, accumulator / STEP_SECONDS);

    updateDebug(debug, intervalMs, performance.now() - workStartMs);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}
