export type Player = {
  x: number;
  y: number;
};

export type Action = "moveUp" | "moveDown" | "moveLeft" | "moveRight";

export type Input = {
  held: Set<string>;
  bindings: Record<Action, string[]>;
};
