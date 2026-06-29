type Position = {
  x: number;
  y: number;
};

type PlateletData = {
  frame: number;
  position1: number;
  position2: number;
  x?: number;
  y?: number;
  deg?: number;
  width?: number;
  height?: number;
};

type CollisionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  deg: number;
};

type FlippinPlateletApi = {
  rand: (...args: number[]) => number;
  page_width: () => number;
  page_height: () => number;
  asset_base_url: () => string;
  prepareFromImage: () => Promise<HTMLImageElement[]>;
  add_platelet: (count: number) => number[];
  collision: (rect?: CollisionRect, pos?: Position) => boolean;
  distance: (x1: number, y1: number, x2: number, y2: number) => number;
  calc: (canvas: HTMLCanvasElement) => void;
  calc_pos: (canvas: HTMLCanvasElement, data: PlateletData) => void;
  render: (canvas: HTMLCanvasElement) => void;
  init: () => Promise<HTMLCanvasElement>;
  run_once: boolean;
  is_mobile: boolean;
  images: HTMLImageElement[] | null;
  canvas_instance: HTMLCanvasElement | null;
  mouse_pos?: Position[];
  data: PlateletData[];
  run: () => Promise<void> | number[];
};

const DEFAULT_ASSET_BASE_URL = "https://reinforcezwei.github.io/flippin-platelet";
const TOTAL_ORIGINAL_FRAMES = 12;
const SPAWN_COUNT = 24;

export function buildImagePaths(assetBase: string): string[] {
  const paths: string[] = [];
  for (let i = 0; i <= TOTAL_ORIGINAL_FRAMES - 1; i += 1) {
    paths.push(`${assetBase}/res/p_${`00000${i}`.slice(-5)}.png`);
  }
  paths.push(`${assetBase}/res/p_00000.png`);
  return paths;
}

export function calcCollision(rect?: CollisionRect, pos?: Position): boolean {
  if (!pos || !rect) {
    return false;
  }
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const rad = (rect.deg / 180) * Math.PI;
  const rx = Math.cos(rad) * (pos.x - centerX) - Math.sin(rad) * (pos.y - centerY) + centerX;
  const ry = Math.sin(rad) * (pos.x - centerX) + Math.cos(rad) * (pos.y - centerY) + centerY;
  const cx = rx < rect.x ? rect.x : rx > rect.x + rect.width ? rect.x + rect.width : rx;
  const cy = ry < rect.y ? rect.y : ry > rect.y + rect.height ? rect.y + rect.height : ry;
  return Math.sqrt((cx - rx) ** 2 + (cy - ry) ** 2) <= 0;
}

function createFlippinPlatelet(doc: Document, win: Window): FlippinPlateletApi {
  const api: FlippinPlateletApi = {
    rand(...args: number[]) {
      let min = 0;
      let max = 1;
      if (args.length === 1) {
        max = args[0];
      } else if (args.length === 2) {
        min = Math.min(args[0], args[1]);
        max = Math.max(args[0], args[1]);
      }
      return min + Math.random() * (max - min);
    },
    page_width() {
      return doc.documentElement.clientWidth;
    },
    page_height() {
      return doc.documentElement.clientHeight;
    },
    asset_base_url() {
      const currentScript = doc.currentScript as HTMLScriptElement | null;
      if (currentScript?.src && currentScript.src.indexOf("://") >= 0) {
        return currentScript.src.replace(/\/flippin_platelet\.js(?:\?.*)?$/, "");
      }
      return DEFAULT_ASSET_BASE_URL;
    },
    prepareFromImage() {
      return new Promise((resolve, reject) => {
        const imagePaths = buildImagePaths(api.asset_base_url());
        const promises = imagePaths.map(
          (path) =>
            new Promise<HTMLImageElement>((res, rej) => {
              const image = doc.createElement("img");
              image.src = path;
              image.addEventListener("load", () => res(image));
              image.addEventListener("error", () => rej(image.src));
            })
        );

        Promise.all(promises)
          .then((images) => resolve(images))
          .catch(() => {
            reject(new Error("image load fail"));
          });
      });
    },
    add_platelet(count: number) {
      const results: number[] = [];
      for (let i = 0; i < count; i += 1) {
        const r = api.rand(4);
        const q = parseInt(String(r), 10);
        const d = r % 1;
        if (api.is_mobile && q !== 0) {
          continue;
        }
        results.push(
          api.data.push({
            frame: 0,
            position1: q,
            position2: d
          })
        );
      }
      return results;
    },
    collision(rect?: CollisionRect, pos?: Position) {
      return calcCollision(rect, pos);
    },
    distance(x1: number, y1: number, x2: number, y2: number) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    calc(canvas: HTMLCanvasElement) {
      const images = api.images;
      if (!images) {
        return;
      }
      const len = images.length;
      api.data.forEach((d) => {
        if (d.x == null) {
          api.calc_pos(canvas, d);
        }
        if (d.frame === len - 1) {
          d.frame = 0;
        }
        if (d.frame > 0) {
          d.frame += 1;
        }
        if (api.mouse_pos) {
          api.mouse_pos.forEach((pos) => {
            if (d.x == null || d.y == null || d.width == null || d.height == null || d.deg == null) {
              return;
            }
            if (
              api.collision(
                {
                  x: d.x,
                  y: d.y,
                  width: d.width,
                  height: d.height,
                  deg: d.deg
                },
                pos
              ) &&
              d.frame === 0
            ) {
              d.frame = 1;
            }
          });
        }
      });
    },
    calc_pos(canvas: HTMLCanvasElement, data: PlateletData) {
      const images = api.images;
      if (!images?.[0]) {
        return;
      }
      let imgWidth = images[0].width;
      let imgHeight = images[0].height;
      if (api.is_mobile) {
        imgWidth /= 1.5;
        imgHeight /= 1.5;
      }

      const width = canvas.width;
      const height = canvas.height;
      let x = 0;
      let y = 0;
      let deg = 0;

      switch (data.position1) {
        case 0:
          x = data.position2 * width - imgWidth / 2;
          y = height - imgHeight * 0.8;
          deg = (data.position2 - 0.5) * 90;
          break;
        case 1:
          x = -imgHeight * 0.2;
          y = data.position2 * height;
          deg = 270 + (data.position2 - 0.5) * 90;
          break;
        case 2:
          x = data.position2 * width - imgWidth / 2;
          y = -imgHeight * 0.2;
          deg = 180 - (data.position2 - 0.5) * 90;
          break;
        case 3:
          x = width - imgHeight * 0.8;
          y = data.position2 * height;
          deg = 90 - (data.position2 - 0.5) * 90;
          break;
        default:
          break;
      }

      deg += api.rand(-5, 5);
      data.x = x;
      data.y = y;
      data.deg = deg;
      data.width = imgWidth;
      data.height = imgHeight;
    },
    render(canvas: HTMLCanvasElement) {
      const images = api.images;
      if (!images) {
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      api.data.forEach((d) => {
        if (d.x == null || d.y == null || d.width == null || d.height == null || d.deg == null) {
          return;
        }
        const frame = d.frame;
        context.save();
        context.translate(d.x + d.width / 2, d.y + d.height / 2);
        context.rotate((-d.deg / 180) * Math.PI);
        context.drawImage(images[frame % images.length], d.width / -2, d.height / -2, d.width, d.height);
        context.restore();
      });
    },
    init() {
      return new Promise((resolve, reject) => {
        const body = doc.getElementsByTagName("body")[0];
        if (!body) {
          reject(new Error("body not found"));
          return;
        }
        const canvas = doc.createElement("canvas");
        canvas.width = api.page_width();
        canvas.height = api.page_height();
        const style = canvas.style;
        style.pointerEvents = "none";
        style.position = "fixed";
        style.zIndex = "9999";
        style.bottom = "0";
        style.left = "0";
        body.appendChild(canvas);
        resolve(canvas);
      });
    },
    run_once: false,
    is_mobile: false,
    images: null,
    canvas_instance: null,
    data: [],
    run() {
      if (api.page_width() < 1000) {
        api.is_mobile = true;
      }
      if (api.run_once) {
        return api.add_platelet(SPAWN_COUNT);
      }
      return api
        .prepareFromImage()
        .then((images) => {
          api.images = images;
          return api
            .init()
            .then((canvas) => {
              api.canvas_instance = canvas;
              api.add_platelet(SPAWN_COUNT);
              win.addEventListener("resize", () => {
                canvas.width = api.page_width();
                canvas.height = api.page_height();
                api.data.forEach((d) => {
                  api.calc_pos(canvas, d);
                });
                api.render(canvas);
              });

              doc.addEventListener("mousemove", (event) => {
                api.mouse_pos = [{ x: event.clientX, y: event.clientY }];
              });

              doc.addEventListener(
                "touchmove",
                (event) => {
                  api.mouse_pos = Array.from(event.touches).map((touch) => ({
                    x: touch.clientX,
                    y: touch.clientY
                  }));
                },
                { passive: true }
              );

              doc.addEventListener(
                "touchend",
                (event) => {
                  api.mouse_pos = Array.from(event.touches).map((touch) => ({
                    x: touch.clientX,
                    y: touch.clientY
                  }));
                },
                { passive: true }
              );

              let i = 1;
              const step = () => {
                if (i % 2) {
                  api.calc(canvas);
                  api.render(canvas);
                }
                i += 1;
                win.requestAnimationFrame(step);
              };
              win.requestAnimationFrame(step);
              api.run_once = true;
            })
            .catch((error) => {
              console.log(error);
              win.alert("init fail");
            });
        })
        .catch((error) => {
          console.log(error);
          win.alert("prepare fail");
        });
    }
  };
  return api;
}

declare global {
  interface Window {
    FlippinPlatelet?: FlippinPlateletApi;
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (!window.FlippinPlatelet) {
    window.FlippinPlatelet = createFlippinPlatelet(document, window);
  }
  window.FlippinPlatelet.run();
}

