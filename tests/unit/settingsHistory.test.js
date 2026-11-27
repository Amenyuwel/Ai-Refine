import { expect, test } from "vitest";
import {
  HISTORY_LIMIT,
  createHistory,
  historyReducer,
} from "@/hooks/useSettingsHistory";

const withBrightness = (value) => ({
  brightness: { enabled: true, value },
  flip: { enabled: false, value: 1 },
});

const run = (history, ...actions) => actions.reduce(historyReducer, history);
const change = (settings) => ({ type: "change", settings });
const canUndo = (history) => history.past.length > 0;
const canRedo = (history) => history.future.length > 0;

const initial = withBrightness(100);

test("starts with nothing to undo or redo", () => {
  const history = createHistory(initial);
  expect(canUndo(history)).toBe(false);
  expect(canRedo(history)).toBe(false);
});

test("change records one step and undo and redo walk it", () => {
  let history = run(createHistory(initial), change(withBrightness(120)));
  expect(history.present).toEqual(withBrightness(120));
  expect(canUndo(history)).toBe(true);

  history = run(history, { type: "undo" });
  expect(history.present).toEqual(initial);
  expect(canUndo(history)).toBe(false);
  expect(canRedo(history)).toBe(true);

  history = run(history, { type: "redo" });
  expect(history.present).toEqual(withBrightness(120));
  expect(canRedo(history)).toBe(false);
});

test("a new change after undo clears redo", () => {
  const history = run(
    createHistory(initial),
    change(withBrightness(120)),
    { type: "undo" },
    change(withBrightness(130)),
  );
  expect(canRedo(history)).toBe(false);
  expect(history.present).toEqual(withBrightness(130));
});

test("undo and redo with empty stacks change nothing", () => {
  const history = createHistory(initial);
  expect(run(history, { type: "undo" })).toEqual(history);
  expect(run(history, { type: "redo" })).toEqual(history);
});

test("a slider drag is one step recorded on release", () => {
  let history = createHistory(initial);
  for (const value of [101, 102, 103, 110]) {
    history = run(history, { type: "drag", settings: withBrightness(value) });
  }
  history = run(history, { type: "release" });

  expect(history.past).toEqual([initial]);
  history = run(history, { type: "undo" });
  expect(history.present).toEqual(initial);
});

test("undo during an unreleased drag settles it first", () => {
  const history = run(
    createHistory(initial),
    { type: "drag", settings: withBrightness(150) },
    { type: "undo" },
  );
  expect(history.present).toEqual(initial);
  expect(canRedo(history)).toBe(true);
});

test("no step for an unchanged value or a drag back to the start", () => {
  let history = run(createHistory(initial), change(withBrightness(100)));
  expect(canUndo(history)).toBe(false);

  history = run(
    history,
    { type: "drag", settings: withBrightness(140) },
    { type: "drag", settings: withBrightness(100) },
    { type: "release" },
  );
  expect(canUndo(history)).toBe(false);
});

test("history keeps only the last 50 steps", () => {
  let history = createHistory(withBrightness(0));
  for (let value = 1; value <= HISTORY_LIMIT + 10; value += 1) {
    history = run(history, change(withBrightness(value)));
  }
  expect(history.past).toHaveLength(HISTORY_LIMIT);

  for (let step = 0; step < HISTORY_LIMIT; step += 1) {
    history = run(history, { type: "undo" });
  }
  expect(canUndo(history)).toBe(false);
  expect(history.present).toEqual(withBrightness(10));
});
