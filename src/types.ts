import type { CharacterState } from "./states.ts";

export type Player = CharacterState & {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
};

export type Action = "moveUp" | "moveDown" | "moveLeft" | "moveRight" | "shoot";

export type Input = {
  held: Set<string>;
  bindings: Record<Action, string[]>;
};
