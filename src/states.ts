export const Direction = {
  Right: "right",
  Left: "left",
  Down: "down",
  Up: "up",
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export type CharacterState = {
  baseRow: number;
  direction: Direction;
  isWalking: boolean;
  isShooting: boolean;
  shotsPerSecond: number;
  animationTime: number;
};
