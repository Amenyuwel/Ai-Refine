export const COMPARISON_START_PERCENT = 50;
export const COMPARISON_KEY_STEP_PERCENT = 5;

export function clampPercent(value) {
  return Math.min(100, Math.max(0, value));
}

// Converts a pointer x position to the divider position as a percent of the box width
export function percentFromPointer(clientX, boxLeft, boxWidth) {
  if (boxWidth <= 0) return COMPARISON_START_PERCENT;
  return clampPercent(((clientX - boxLeft) / boxWidth) * 100);
}
