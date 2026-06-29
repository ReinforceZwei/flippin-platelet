import { buildImagePaths, calcCollision } from "./flippin_platelet";

describe("buildImagePaths", () => {
  it("builds 13 paths and repeats frame 0 at the end", () => {
    const paths = buildImagePaths("https://example.com/flippin-platelet");
    expect(paths).toHaveLength(13);
    expect(paths[0]).toBe("https://example.com/flippin-platelet/res/p_00000.png");
    expect(paths[11]).toBe("https://example.com/flippin-platelet/res/p_00011.png");
    expect(paths[12]).toBe("https://example.com/flippin-platelet/res/p_00000.png");
  });
});

describe("calcCollision", () => {
  it("returns true for a point inside an unrotated rectangle", () => {
    const hit = calcCollision(
      { x: 100, y: 100, width: 200, height: 100, deg: 0 },
      { x: 200, y: 150 }
    );
    expect(hit).toBe(true);
  });

  it("returns false for a point outside an unrotated rectangle", () => {
    const hit = calcCollision(
      { x: 100, y: 100, width: 200, height: 100, deg: 0 },
      { x: 50, y: 80 }
    );
    expect(hit).toBe(false);
  });
});

