export type Player = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
};

export type Action = "moveUp" | "moveDown" | "moveLeft" | "moveRight";

export type Input = {
  held: Set<string>;
  bindings: Record<Action, string[]>;
};
