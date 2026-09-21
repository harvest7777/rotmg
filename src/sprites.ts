import spritesheetUrl from "./sprites/spritesheet.png";

export const SPRITE_SIZE = 8;

export type Spritesheet = {
  image: HTMLImageElement;
  uvWidth: number;
  uvHeight: number;
};

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
  };
}
