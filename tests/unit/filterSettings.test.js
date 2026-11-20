import { expect, test } from "vitest";
import {
  DEFAULT_SETTINGS,
  ROTATE_MAX,
  ROTATE_MIN,
  ZOOM_MAX,
  ZOOM_MIN,
  getExportFilters,
  getRotationCoverScale,
} from "@/utils/filterSettings";

test("default settings export with no effect", () => {
  expect(getExportFilters(DEFAULT_SETTINGS, 400, 300)).toEqual({
    flip: false,
    rotateDegrees: 0,
    zoomPercent: 100,
    grayscalePercent: 0,
    blurRadius: 0,
    brightnessPercent: 100,
  });
});

test("settings without rotate or zoom export as unrotated and unzoomed", () => {
  const { rotate, zoom, ...olderSettings } = DEFAULT_SETTINGS;
  expect(rotate).toEqual({ enabled: false, value: 0 });
  expect(zoom).toEqual({ enabled: false, value: 100 });
  const filters = getExportFilters(olderSettings, 400, 300);
  expect(filters.rotateDegrees).toBe(0);
  expect(filters.zoomPercent).toBe(100);
});

test("enabled rotate and zoom export their values", () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    rotate: { enabled: true, value: -12 },
    zoom: { enabled: true, value: 125 },
  };
  const filters = getExportFilters(settings, 400, 300);
  expect(filters.rotateDegrees).toBe(-12);
  expect(filters.zoomPercent).toBe(125);
});

test("disabled rotate and zoom keep their values out of the export", () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    rotate: { enabled: false, value: 20 },
    zoom: { enabled: false, value: 140 },
  };
  const filters = getExportFilters(settings, 400, 300);
  expect(filters.rotateDegrees).toBe(0);
  expect(filters.zoomPercent).toBe(100);
});

test("rotate and zoom ranges match the decided limits", () => {
  expect([ROTATE_MIN, ROTATE_MAX]).toEqual([-30, 30]);
  expect([ZOOM_MIN, ZOOM_MAX]).toEqual([100, 150]);
});

test("no rotation needs no cover scale", () => {
  expect(getRotationCoverScale(0, 400, 300)).toBe(1);
});

test("cover scale is the same for either direction", () => {
  expect(getRotationCoverScale(-17, 400, 300)).toBe(
    getRotationCoverScale(17, 400, 300),
  );
});

// The frame's corners, turned back by the angle, must land inside the scaled
// image, and at least one must sit on its edge (scaled up just enough).
test.each([
  [30, 400, 300],
  [-30, 300, 400],
  [5, 40, 30],
  [1, 1000, 1000],
])("rotating %i° at %ix%i just covers the frame", (degrees, width, height) => {
  const scale = getRotationCoverScale(degrees, width, height);
  const radians = (degrees * Math.PI) / 180;
  const corners = [
    [width / 2, height / 2],
    [-width / 2, height / 2],
  ];
  const reach = corners.flatMap(([x, y]) => {
    const backX = x * Math.cos(radians) + y * Math.sin(radians);
    const backY = -x * Math.sin(radians) + y * Math.cos(radians);
    return [
      Math.abs(backX) / ((scale * width) / 2),
      Math.abs(backY) / ((scale * height) / 2),
    ];
  });
  expect(Math.max(...reach)).toBeCloseTo(1, 10);
});
