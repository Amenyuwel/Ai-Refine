// Seeded randomness for reproducible exports. Nothing here uses Math.random,
// so the same seed always gives the same dataset.

// 32-bit FNV-1a hash of any list of strings and numbers. JSON keeps the parts
// apart, so ("ab", "c") and ("a", "bc") hash differently.
export const hashSeed = (...parts) => {
  const text = JSON.stringify(parts);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

// mulberry32: a small, fast generator with a 32-bit state. Returns a function
// that gives the next number in [0, 1) on each call.
export const createRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};
