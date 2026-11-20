import { expect, test } from "vitest";
import { createRandom, hashSeed } from "@/utils/random";

const take = (random, count) => Array.from({ length: count }, () => random());

test("the same seed gives the same sequence", () => {
  expect(take(createRandom(42), 20)).toEqual(take(createRandom(42), 20));
});

test("different seeds give different sequences", () => {
  expect(take(createRandom(1), 20)).not.toEqual(take(createRandom(2), 20));
});

test("values stay in [0, 1)", () => {
  const values = take(createRandom(7), 10000);
  expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
});

test("hashSeed is stable and keeps its parts apart", () => {
  expect(hashSeed(1, "cat", 0)).toBe(hashSeed(1, "cat", 0));
  expect(hashSeed("ab", "c")).not.toBe(hashSeed("a", "bc"));
  expect(hashSeed(1, "cat", 0)).not.toBe(hashSeed(1, "cat", 1));
});
