import { createDebug, updateDebug } from "./debug.ts";
import { createInput, isActive } from "./input.ts";
import { createRenderer, render } from "./renderer.ts";
import { loadSpritesheet } from "./sprites.ts";
import { Direction } from "./states.ts";
import type { Input, Player } from "./types.ts";

const PLAYER_SPEED = 180;
const STEP_SECONDS = 1 / 60;
const MAX_FRAME_SECONDS = 0.25;

await main();

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

  player.isWalking = dx !== 0 || dy !== 0;
  player.isShooting = isActive(input, "shoot");
  if (dx !== 0) {
    player.direction = dx < 0 ? Direction.Left : Direction.Right;
  } else if (dy !== 0) {
    player.direction = dy < 0 ? Direction.Up : Direction.Down;
  }

  const isAnimating = player.isWalking || player.isShooting;
  player.animationTime = isAnimating ? player.animationTime + dt : 0;
}

async function main() {
  const spritesheet = await loadSpritesheet();
  const canvas = document.querySelector("#gl-canvas") as HTMLCanvasElement;
  const renderer = createRenderer(canvas, spritesheet);
  const input = createInput();
  const debug = createDebug();
  const player: Player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    prevX: canvas.width / 2,
    prevY: canvas.height / 2,
    baseRow: 3,
    direction: Direction.Down,
    isWalking: false,
    isShooting: false,
    shotsPerSecond: 3,
    animationTime: 0,
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
