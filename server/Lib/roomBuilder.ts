import { Actor, Color, Engine, Random, Vector } from "../HeadlessEx";
import { PerlinGenerator } from "@excaliburjs/plugin-perlin";

const FLOORTHRESHHOLD = 0.65;

const generator = new PerlinGenerator({
  seed: Date.now(), // random seed
  octaves: 2, // number of times noise is laid on itself
  frequency: 20, // number of times the pattern oscillates, higher is like zooming out
  amplitude: 1.0, // [0-1] amplitude determines the relative height of the peaks generated in the noise
  persistance: 1.0, // [0-1] he persistance determines how quickly the amplitude will drop off, a high degree of persistance results in smoother patterns, a low degree of persistance generates spiky patterns.
});

enum RoomDesigns {
  EngineeRoom = "EngineeRoom",
  Bunker = "Bunker",
  ControlRoom = "ControlRoom",
  Lab = "Lab",
  Corridor = "Corridor",
  CargoRoom = "CargoRoom",
}

export class RoomBuilder {
  rng: Random;
  pallett: string[] = [];
  palletGenerator = new ColorPaletteGenerator(Date.now());
  constructor(public engine: Engine, seed?: number) {
    this.rng = seed ? new Random(seed) : new Random();
    this.pallett = this.generatePallette(6, 30);
    PixelSwap.setColorMask(["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff"]);
    PixelSwap.setPallet(this.pallett);
  }

  async generateRoom(): Promise<Actor> {
    //const tilemap = new TileMap(tOptions);
    let skipFloorFlag = false;
    let skipWallFlag = false;
    //let reservedFloorSprite: Sprite | null = null;
    //let reservedWallSprite: Sprite | null = null;
    let tileIndex = 0;

    /* for (let tile of tilemap.tiles) {
      if (isEdgeTile(tileIndex, tilemap.columns, tilemap.rows)) {
        let newtile = walltiles.getSprite(1, 0);
        newtile = await PixelSwap.swapSprite(newtile);
        tile.addGraphic(newtile);
      }

      if (isUpperWall(tileIndex, tilemap.columns, tilemap.rows)) {
        let newtile = walltiles.getSprite(0, 0);
        newtile = await PixelSwap.swapSprite(newtile);
        tile.addGraphic(newtile);
      }

      if (isLeftWall(tileIndex, tilemap.columns, tilemap.rows)) {
        let newtile = walltiles.getSprite(0, 0);
        newtile = await PixelSwap.swapSprite(newtile);
        tile.addGraphic(newtile);
      }

      if (isRightWall(tileIndex, tilemap.columns, tilemap.rows)) {
        let newtile = walltiles.getSprite(0, 0);
        newtile = await PixelSwap.swapSprite(newtile);
        tile.addGraphic(newtile);
      }

      if (isFloorTile(tileIndex, tilemap.columns, tilemap.rows)) {
        let newtile = floortiles.getSprite(this.rng.integer(0, 3), 0);
        newtile = await PixelSwap.swapSprite(newtile);
        tile.addGraphic(newtile);
      }

      //wall accents

      const walltile =
        isLeftWall(tileIndex, tilemap.columns, tilemap.rows) ||
        isRightWall(tileIndex, tilemap.columns, tilemap.rows) ||
        isUpperWall(tileIndex, tilemap.columns, tilemap.rows);

      if (skipWallFlag) {
        if (reservedWallSprite) tile.addGraphic(reservedWallSprite);
        skipWallFlag = false;
      } else if (!skipWallFlag && walltile) {
        if (isAccentUsed(tileIndex, tilemap.columns, tilemap.rows)) {
          let accent = this.rng.pickOne(wallAccentArray);
          if (Array.isArray(accent)) {
            // use returned array as multi tile sprites
            tile.addGraphic(accent[0]);
            reservedWallSprite = accent[1];
            skipWallFlag = true;
          } else {
            // use sprite
            tile.addGraphic(accent);
          }
        }
      }

      //floor accents

      if (skipFloorFlag) {
        if (reservedFloorSprite) tile.addGraphic(reservedFloorSprite);
        skipFloorFlag = false;
      } else if (!skipFloorFlag && isFloorTile(tileIndex, tilemap.columns, tilemap.rows)) {
        if (isAccentUsed(tileIndex, tilemap.columns, tilemap.rows)) {
          let accent = this.rng.pickOne(floorAccentArray);
          if (typeof accent === "string") {
            // do lamp animation
            tile.addGraphic(lampanimation);
          } else if (Array.isArray(accent)) {
            // use returned array as multi tile sprites

            tile.addGraphic(accent[0]);
            reservedFloorSprite = accent[1];
            skipFloorFlag = true;
          } else {
            // use sprite

            tile.addGraphic(accent);
          }
        }
      }

      tileIndex++;
    } */

    const room = new Actor({
      x: 0,
      y: 0,
      width: 400,
      height: 288,
      scale: new Vector(2, 2),
      z: 2,
      anchor: Vector.Zero,
    });

    //room.addChild(tilemap);

    const upperDoor = new Actor({
      x: room.width / 4 - 24,
      y: 16,
      width: 48,
      height: 32,
      z: 2,
      anchor: Vector.Zero,
    });

    const upperBlackBlankChild = new Actor({
      name: "upperBlackBlank",
      x: 0,
      y: 0,
      width: 1,
      height: 32,
      anchor: Vector.Zero,
      z: 2,
      color: Color.Black,
    });

    upperBlackBlankChild.onPreUpdate = (engine: Engine, deltatime: number) => {
      let distance = upDoorRightChild.pos.distance(upDoorLeftChild.pos);

      upperBlackBlankChild.scale.x = distance - 24;
      upperBlackBlankChild.pos.x = upDoorLeftChild.pos.x + 24;
    };

    const upDoorLeftChild = new Actor({
      name: "upleftDoor",
      x: 0,
      y: 0,
      width: 24,
      height: 32,
      anchor: Vector.Zero,
      z: 3,
    });
    //upDoorLeftChild.graphics.use(Resources.upperLeftDoor.toSprite());

    upDoorLeftChild.actions.repeatForever(ctx => {
      ctx.easeBy(-20, 0, 1200).delay(3000).easeBy(20, 0, 1200).delay(3000);
    });

    const upDoorRightChild = new Actor({
      name: "uprightDoor",
      x: 24,
      y: 0,
      width: 24,
      height: 32,
      anchor: Vector.Zero,
      z: 3,
    });

    //upDoorRightChild.graphics.use(Resources.upperRightDoor.toSprite());
    upDoorRightChild.actions.repeatForever(ctx => {
      ctx.easeBy(20, 0, 1200).delay(3000).easeBy(-20, 0, 1200).delay(3000);
    });

    upperDoor.addChild(upDoorLeftChild);
    upperDoor.addChild(upDoorRightChild);
    upperDoor.addChild(upperBlackBlankChild);

    const lowerDoor = new Actor({
      x: room.width / 4 - 24,
      y: room.height / 2 - 51,
      width: 48,
      height: 3,

      z: 2,
      anchor: Vector.Zero,
      color: Color.Red,
    });

    let lowerLeftChild = new Actor({
      name: "lowerLeftDoor",
      x: 0,
      y: 0,
      width: 24,
      height: 3,
      anchor: Vector.Zero,
      z: 3,
    });
    //lowerLeftChild.graphics.use(Resources.lowerLeftDoor.toSprite());

    lowerLeftChild.actions.repeatForever(ctx => {
      ctx.easeBy(-20, 0, 1200).delay(3000).easeBy(20, 0, 1200).delay(3000);
    });

    let lowerRightChild = new Actor({
      name: "lowerRightDoor",
      x: 24,
      y: 0,
      width: 24,
      height: 3,
      anchor: Vector.Zero,
      z: 3,
    });
    //lowerRightChild.graphics.use(Resources.lowerRightDoor.toSprite());
    lowerRightChild.actions.repeatForever(ctx => {
      ctx.easeBy(20, 0, 1200).delay(3000).easeBy(-20, 0, 1200).delay(3000);
    });
    lowerDoor.addChild(lowerLeftChild);
    lowerDoor.addChild(lowerRightChild);

    const lowerBlackBlankChild = new Actor({
      name: "lowerBlackBlank",
      x: 0,
      y: 0,
      width: 1,
      height: 3,
      anchor: Vector.Zero,
      z: 2,
      color: Color.Black,
    });
    lowerBlackBlankChild.onPreUpdate = (engine: Engine, deltatime: number) => {
      let distance = lowerLeftChild.pos.distance(lowerRightChild.pos);

      lowerBlackBlankChild.scale.x = distance - 24;
      lowerBlackBlankChild.pos.x = lowerLeftChild.pos.x + 24;
    };
    lowerDoor.addChild(lowerBlackBlankChild);

    const leftDoor = new Actor({
      x: 16,
      y: room.height / 4 - 48,
      width: 16,
      height: 48,

      z: 2,
      anchor: Vector.Zero,
    });

    const leftDoorLeftChild = new Actor({
      name: "leftDoorLeftChild",
      x: 0,
      y: 24,
      width: 16,
      height: 24,
      anchor: Vector.Zero,
      z: 3,
    });
    //leftDoorLeftChild.graphics.use(Resources.sideDoorLeft.toSprite());
    leftDoorLeftChild.actions.repeatForever(ctx => {
      ctx.easeBy(0, 20, 1200).delay(3000).easeBy(0, -20, 1200).delay(3000);
    });
    leftDoor.addChild(leftDoorLeftChild);

    const leftDoorRightChild = new Actor({
      name: "leftDoorRightChild",
      x: 0,
      y: 0,
      width: 16,
      height: 24,
      anchor: Vector.Zero,
      z: 3,
    });
    //leftDoorRightChild.graphics.use(Resources.sideDoorRight.toSprite());
    leftDoorRightChild.actions.repeatForever(ctx => {
      ctx.easeBy(0, -20, 1200).delay(3000).easeBy(0, 20, 1200).delay(3000);
    });
    leftDoor.addChild(leftDoorRightChild);

    const leftBlackBlankChild = new Actor({
      name: "leftBlackBlank",
      x: 0,
      y: 0,
      width: 16,
      height: 1,
      anchor: Vector.Zero,
      z: 2,
      color: Color.Black,
    });

    leftBlackBlankChild.onPreUpdate = (engine: Engine, deltatime: number) => {
      let distance = upDoorRightChild.pos.distance(upDoorLeftChild.pos);

      leftBlackBlankChild.scale.y = distance - 24;
      leftBlackBlankChild.pos.y = leftDoorRightChild.pos.y + 24;
    };

    leftDoor.addChild(leftBlackBlankChild);

    const rightDoor = new Actor({
      x: room.width / 2 - 32,
      y: room.height / 4 - 48,
      width: 16,
      height: 48,

      z: 2,
      anchor: Vector.Zero,
    });

    const rightDoorLeftChild = new Actor({
      name: "rightDoorLeftChild",
      x: 0,
      y: 24,
      width: 16,
      height: 24,
      anchor: Vector.Zero,
      z: 3,
    });
    //let rightdoorSprite = Resources.sideDoorLeft.toSprite();
    //rightdoorSprite.flipHorizontal = true;
    //rightDoorLeftChild.graphics.use(rightdoorSprite);
    rightDoorLeftChild.actions.repeatForever(ctx => {
      ctx.easeBy(0, 20, 1200).delay(3000).easeBy(0, -20, 1200).delay(3000);
    });
    rightDoor.addChild(rightDoorLeftChild);

    const rightDoorRightChild = new Actor({
      name: "rightDoorRightChild",
      x: 0,
      y: 0,
      width: 16,
      height: 24,
      anchor: Vector.Zero,
      z: 3,
    });
    /* let leftdoorSprite = Resources.sideDoorLeft.toSprite();
    leftdoorSprite.flipHorizontal = true;
    leftdoorSprite.flipVertical = true;
    rightDoorRightChild.graphics.use(leftdoorSprite); */
    rightDoorRightChild.actions.repeatForever(ctx => {
      ctx.easeBy(0, -20, 1200).delay(3000).easeBy(0, 20, 1200).delay(3000);
    });
    rightDoor.addChild(rightDoorRightChild);

    const rightBlackBlankChild = new Actor({
      name: "rightBlackBlank",
      x: 0,
      y: 0,
      width: 16,
      height: 1,
      anchor: Vector.Zero,
      z: 2,
      color: Color.Black,
    });

    rightBlackBlankChild.onPreUpdate = (engine: Engine, deltatime: number) => {
      let distance = rightDoorLeftChild.pos.distance(rightDoorRightChild.pos);

      rightBlackBlankChild.scale.y = distance - 24;
      rightBlackBlankChild.pos.y = rightDoorRightChild.pos.y + 24;
    };

    rightDoor.addChild(rightBlackBlankChild);

    const player1UIField = new Actor({
      x: 16,
      y: 16,
      width: 32,
      height: 32,
      z: 2,
      anchor: Vector.Half,
      color: Color.Black,
    });

    /*  let nineConfig: NineSliceConfig = {
      width: 32,
      source: Resources.nineframe,
      height: 32,
      sourceConfig: {
        width: 48,
        height: 32,
        topMargin: 3,
        leftMargin: 5,
        bottomMargin: 3,
        rightMargin: 5,
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: NineSliceStretch.TileFit,
        stretchV: NineSliceStretch.TileFit,
      },
    };
    let steelpanel = new NineSlice(nineConfig);

    let ggoptions = new GraphicsGroup({
      useAnchor: false,
      members: [
        {
          graphic: steelpanel,
          offset: new Vector(0, 0),
        },
        {
          graphic: Resources.avatar.toSprite(),
          offset: new Vector(3, 3),
        },
      ],
    }); */

    //player1UIField.graphics.use(ggoptions);

    const player2UIField = new Actor({
      x: room.width / 2 - 48,
      y: 16,
      width: 32,
      height: 32,

      z: 2,
      anchor: Vector.Half,
      color: Color.Black,
    });

    /*   let p2ggoptions = new GraphicsGroup({
      useAnchor: false,
      members: [
        {
          graphic: steelpanel,
          offset: new Vector(0, 0),
        },
        {
          graphic: Resources.question.toSprite(),
          offset: new Vector(3, 3),
        },
      ],
    });

    player2UIField.graphics.use(p2ggoptions);

    let nineConfig2: NineSliceConfig = {
      width: 96,
      source: Resources.nineframe,
      height: 32,
      sourceConfig: {
        width: 48,
        height: 32,
        topMargin: 3,
        leftMargin: 5,
        bottomMargin: 3,
        rightMargin: 5,
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: NineSliceStretch.TileFit,
        stretchV: NineSliceStretch.TileFit,
      },
    };
    let steelpanel2 = new NineSlice(nineConfig2);
 */
    const player1ScoreField = new Actor({
      x: 32,
      y: 48,
      width: 96,
      height: 32,
      z: 2,
      anchor: Vector.Zero,
      color: Color.Black,
    });

    /*    let p1TextField = new Label({
      text: "0000000",
      x: 5,
      y: 5,
      font: new Font({
        size: 24,
        family: "Black Ops One",
        color: Color.Blue,
      }),
      anchor: Vector.Zero,
      z: 2,
    }); */
    //player1ScoreField.graphics.use(steelpanel2);

    //player1ScoreField.addChild(p1TextField);

    /*     let p2TextField = new Label({
      text: "0000000",
      x: 5,
      y: 5,
      font: new Font({
        size: 24,
        family: "Black Ops One",
        color: Color.Red,
      }),
      anchor: Vector.Zero,
      z: 2,
    }); */

    const player2ScoreField = new Actor({
      x: room.width / 2 - 128,
      y: 48,
      width: 96,
      height: 32,

      z: 2,
      anchor: Vector.Half,
      color: Color.Black,
    });

    // player2ScoreField.graphics.use(steelpanel2);
    // player2ScoreField.addChild(p2TextField);

    room.addChild(upperDoor);
    room.addChild(lowerDoor);
    room.addChild(leftDoor);
    room.addChild(rightDoor);

    room.addChild(player1UIField);
    room.addChild(player2UIField);
    room.addChild(player1ScoreField);
    room.addChild(player2ScoreField);

    return room;
  }

  generatePallette(numColors: number, angle: number): string[] {
    return this.palletGenerator.generateAnalogousPalette(numColors, angle);
  }
}

export class ColorPaletteGenerator {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  generateAnalogousPalette(numColors: number, angle: number): string[] {
    const colors: string[] = [];
    const baseColor = this.generateRandomColor();

    const baseHSL = this.rgbToHsl(this.hexToRgb(baseColor));

    for (let i = 0; i < numColors; i++) {
      const hue = (baseHSL.h + angle * i) % 360;
      const saturation = baseHSL.s;
      const lightness = baseHSL.l;

      const color = this.hslToHex({ h: hue, s: saturation, l: lightness });
      colors.push(color);
    }

    return colors;
  }

  private generateRandomColor(): string {
    const red = this.getRandomValue(0, 255);
    const green = this.getRandomValue(0, 255);
    const blue = this.getRandomValue(0, 255);
    return this.rgbToHex({ r: red, g: green, b: blue });
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const sanitizedHex = hex.replace("#", "");
    const bigint = parseInt(sanitizedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  private rgbToHsl(rgb: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  private hslToHex(hsl: { h: number; s: number; l: number }): string {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    const hueToRgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hueToRgb(p, q, h) * 255);
    const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  private getRandomValue(min: number, max: number): number {
    const random = this.generateRandomNumber();
    return Math.floor(random * (max - min + 1) + min);
  }

  private generateRandomNumber(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    return `#${((1 << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b).toString(16).slice(1)}`;
  }
}

function isEdgeTile(index: number, width: number, height: number): boolean {
  const x = index % width; // column
  const y = Math.floor(index / width); // row

  // Check if the tile is on the edge
  return x === 0 || x === width - 1 || y === 0 || y === height - 1;
}

function isUpperWall(index: number, width: number, height: number): boolean {
  const x = index % width; // column
  const y = Math.floor(index / width); // row

  if (x != 0 && x != width - 1 && (y == 1 || y == 2)) return true;
  return false;
}

function isLeftWall(index: number, width: number, height: number): boolean {
  const x = index % width; // column
  const y = Math.floor(index / width); // row

  if (x == 1 && y > 2 && y < height - 1) return true;
  return false;
}

function isRightWall(index: number, width: number, height: number): boolean {
  const x = index % width; // column
  const y = Math.floor(index / width); // row
  if (x == width - 2 && y > 2 && y < height - 1) return true;
  return false;
}

function isFloorTile(index: number, width: number, height: number): boolean {
  const x = index % width; // column
  const y = Math.floor(index / width); // row
  if (x > 1 && x < width - 2 && y > 2 && y < height - 1) return true;
  return false;
}

function isAccentUsed(index: number, width: number, height: number): boolean {
  const grid = generator.grid(width, height);
  const noiseValue = grid[index];

  if (noiseValue > FLOORTHRESHHOLD) return true;
  return false;
}

export class PixelSwap {
  static colorMask: string[] = [];
  static pallette: string[] = [];

  static setColorMask(colors: string[]) {
    PixelSwap.colorMask = colors;
  }

  static setPallet(colors: string[]) {
    PixelSwap.pallette = colors;
  }

  /*  static async swapSprite(sprite: Sprite): Promise<Sprite> {
    return new Promise(async (resolve, reject) => {
      const newSprite = sprite.clone();

      const newCanvas = document.createElement("canvas");
      newCanvas.id = "newCanvas";
      newCanvas.width = newSprite.width;
      newCanvas.height = newSprite.height;

      const newCtx = newCanvas.getContext("2d", { willReadFrequently: true });

      if (newCtx) {
        newCtx.drawImage(
          newSprite.image.image,
          newSprite.sourceView.x,
          newSprite.sourceView.y,
          newSprite.sourceView.width,
          newSprite.sourceView.height,
          0,
          0,
          newSprite.width,
          newSprite.height
        );
        //get imagedata
        const imageData = newCtx.getImageData(0, 0, newSprite.width, newSprite.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const color = `#${data[i].toString(16).padStart(2, "0")}${data[i + 1].toString(16).padStart(2, "0")}${data[i + 2]
            .toString(16)
            .padStart(2, "0")}`;

          if (PixelSwap.colorMask.includes(color)) {
            //which index of color mask matches
            const index = PixelSwap.colorMask.indexOf(color);
            const newcolor = Color.fromHex(PixelSwap.pallette[index]);

            data[i] = newcolor.r;
            data[i + 1] = newcolor.g;
            data[i + 2] = newcolor.b;
          }
        }
        newCtx.putImageData(imageData, 0, 0);
        //take canvas.todataurl image and set new ImageSource to that image

        const newImage = new ImageSource(newCanvas.toDataURL());
        await newImage.load();
        resolve(newImage.toSprite());
      }
    });
  } */
}
