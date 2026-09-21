export type Player = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  spriteColumn: number;
  spriteRow: number;
};

export type Action = "moveUp" | "moveDown" | "moveLeft" | "moveRight";

export type Input = {
  held: Set<string>;
  bindings: Record<Action, string[]>;
};
