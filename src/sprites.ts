import spritesheetUrl from "./sprites/theGoldenArcher.png";
import { Direction, type CharacterState } from "./states.ts";

export const SPRITE_SIZE = 8;

const WALK_COLUMNS = 3;
const SHOOT_COLUMN = 4;
const SHOOT_FRAMES = 2;
const WALK_FPS = 3;

const ROW_OFFSET_BY_DIRECTION: Record<Direction, number> = {
  [Direction.Right]: 0,
  [Direction.Left]: 0,
  [Direction.Down]: 1,
  [Direction.Up]: 2,
};

export type SpriteFrame = {
  column: number;
  row: number;
  mirrored: boolean;
};

export type Spritesheet = {
  image: HTMLImageElement;
  uvWidth: number;
  uvHeight: number;
  walkFrames: number[];
};

function scanWalkFrames(image: HTMLImageElement): number[] {
  const { naturalWidth, naturalHeight } = image;
  const canvas = new OffscreenCanvas(naturalWidth, naturalHeight);
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("2d context is not available");
  }

  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, naturalWidth, naturalHeight);

  const walkFrames: number[] = [];
  for (let row = 0; row < naturalHeight / SPRITE_SIZE; row++) {
    let frames = 0;
    for (let column = 0; column < WALK_COLUMNS; column++) {
      let filled = false;
      for (let y = 0; y < SPRITE_SIZE && !filled; y++) {
        for (let x = 0; x < SPRITE_SIZE && !filled; x++) {
          const pixel = (row * SPRITE_SIZE + y) * naturalWidth + column * SPRITE_SIZE + x;
          filled = data[pixel * 4 + 3] > 0;
        }
      }
      if (!filled) {
        break;
      }
      frames++;
    }
    walkFrames.push(frames);
  }

  return walkFrames;
}

export async function loadSpritesheet(): Promise<Spritesheet> {
  const image = new Image();
  image.src = spritesheetUrl;
  await image.decode();

  const { naturalWidth, naturalHeight } = image;
  if (naturalWidth % SPRITE_SIZE !== 0 || naturalHeight % SPRITE_SIZE !== 0) {
    throw new Error(
      `spritesheet ${naturalWidth}x${naturalHeight} is not a multiple of ${SPRITE_SIZE}`,
    );
  }

  return {
    image,
    uvWidth: SPRITE_SIZE / naturalWidth,
    uvHeight: SPRITE_SIZE / naturalHeight,
    walkFrames: scanWalkFrames(image),
  };
}

export function characterFrame(
  spritesheet: Spritesheet,
  state: CharacterState,
): SpriteFrame {
  const row = state.baseRow + ROW_OFFSET_BY_DIRECTION[state.direction];
  const mirrored = state.direction === Direction.Left;

  if (state.isShooting) {
    const fps = state.shotsPerSecond * SHOOT_FRAMES;
    const step = Math.floor(state.animationTime * fps) % SHOOT_FRAMES;
    return { column: SHOOT_COLUMN + step, row, mirrored };
  }

  if (state.isWalking) {
    const step = Math.floor(state.animationTime * WALK_FPS);
    return { column: step % (spritesheet.walkFrames[row] || 1), row, mirrored };
  }

  return { column: 0, row, mirrored };
}
