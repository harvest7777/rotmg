import type { Action, Input } from "./types.ts";

const DEFAULT_BINDINGS: Record<Action, string[]> = {
  moveUp: ["KeyW"],
  moveDown: ["KeyS"],
  moveLeft: ["KeyA"],
  moveRight: ["KeyD"],
  shoot: ["Space"],
};

export function createInput(): Input {
  const input: Input = {
    held: new Set<string>(),
    bindings: structuredClone(DEFAULT_BINDINGS),
  };
  window.addEventListener("keydown", (event) => input.held.add(event.code));
  window.addEventListener("keyup", (event) => input.held.delete(event.code));
  return input;
}

export function isActive(input: Input, action: Action) {
  return input.bindings[action].some((code) => input.held.has(code));
}
