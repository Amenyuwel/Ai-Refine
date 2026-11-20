import { expect, test } from "vitest";
import { assignSplits } from "@/utils/splitAssignment";

const makeKeys = (count) =>
  Array.from({ length: count }, (_, index) => `image-${index}`);

const countSplits = (splits) => {
  const counts = { train: 0, val: 0, test: 0 };
  for (const split of splits.values()) counts[split] += 1;
  return counts;
};

test.each([
  [1, { train: 1, val: 0, test: 0 }],
  [2, { train: 2, val: 0, test: 0 }],
  [3, { train: 3, val: 0, test: 0 }],
  [7, { train: 5, val: 1, test: 1 }],
  [10, { train: 6, val: 2, test: 2 }],
  [20, { train: 14, val: 3, test: 3 }],
  [100, { train: 70, val: 15, test: 15 }],
])("%i images split as %o", (count, expected) => {
  expect(countSplits(assignSplits(makeKeys(count), 1))).toEqual(expected);
});

test("every key gets exactly one split", () => {
  const keys = makeKeys(37);
  const splits = assignSplits(keys, 1);
  expect([...splits.keys()].sort()).toEqual([...keys].sort());
  for (const split of splits.values()) {
    expect(["train", "val", "test"]).toContain(split);
  }
});

test("no keys give an empty map", () => {
  expect(assignSplits([], 1).size).toBe(0);
});

test("input order does not change the result", () => {
  const keys = makeKeys(50);
  const reversed = [...keys].reverse();
  const forward = assignSplits(keys, 8);
  const backward = assignSplits(reversed, 8);
  for (const key of keys) expect(backward.get(key)).toBe(forward.get(key));
});

test("the same seed gives the same splits and another seed changes them", () => {
  const keys = makeKeys(50);
  expect(assignSplits(keys, 8)).toEqual(assignSplits(keys, 8));
  expect(assignSplits(keys, 9)).not.toEqual(assignSplits(keys, 8));
});
