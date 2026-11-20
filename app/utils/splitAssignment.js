import { createRandom, hashSeed } from "@/utils/random";

const VAL_SHARE = 0.15;
const TEST_SHARE = 0.15;
// Below this, val and test would take most of a tiny set, so it all trains.
const MIN_IMAGES_TO_SPLIT = 3;

// Fisher-Yates shuffle into a new array.
const shuffle = (items, random) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

// Map of fileKey to "train" | "val" | "test" for the original images, aiming
// at 70/15/15. Variants take their source image's split, so no image leaks
// across splits. Keys are sorted first so input order does not matter.
export const assignSplits = (fileKeys, seed) => {
  const sortedKeys = [...fileKeys].sort();
  const count = sortedKeys.length;
  if (count < MIN_IMAGES_TO_SPLIT) {
    return new Map(sortedKeys.map((fileKey) => [fileKey, "train"]));
  }

  const valCount = Math.round(VAL_SHARE * count);
  const testCount = Math.round(TEST_SHARE * count);
  const shuffledKeys = shuffle(
    sortedKeys,
    createRandom(hashSeed(seed, "split")),
  );
  return new Map(
    shuffledKeys.map((fileKey, index) => {
      if (index < valCount) return [fileKey, "val"];
      if (index < valCount + testCount) return [fileKey, "test"];
      return [fileKey, "train"];
    }),
  );
};
