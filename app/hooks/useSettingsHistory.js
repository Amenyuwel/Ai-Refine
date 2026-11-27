import { useCallback, useReducer } from "react";

export const HISTORY_LIMIT = 50;

const isSameSettings = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const createHistory = (initialSettings) => ({
  past: [],
  present: initialSettings,
  future: [],
  // Settings from before an uncommitted slider drag started
  dragStart: null,
});

const recordStep = (history, previous) => {
  if (isSameSettings(previous, history.present)) return { ...history, dragStart: null };
  return {
    ...history,
    past: [...history.past, previous].slice(-HISTORY_LIMIT),
    future: [],
    dragStart: null,
  };
};

const endDrag = (history) =>
  history.dragStart ? recordStep(history, history.dragStart) : history;

export const historyReducer = (history, action) => {
  switch (action.type) {
    case "change": {
      const settled = endDrag(history);
      return recordStep({ ...settled, present: action.settings }, settled.present);
    }
    case "drag":
      return {
        ...history,
        present: action.settings,
        dragStart: history.dragStart ?? history.present,
      };
    case "release":
      return endDrag(history);
    case "undo": {
      const settled = endDrag(history);
      if (settled.past.length === 0) return settled;
      return {
        ...settled,
        past: settled.past.slice(0, -1),
        present: settled.past[settled.past.length - 1],
        future: [settled.present, ...settled.future],
      };
    }
    case "redo": {
      const settled = endDrag(history);
      if (settled.future.length === 0) return settled;
      return {
        ...settled,
        past: [...settled.past, settled.present].slice(-HISTORY_LIMIT),
        present: settled.future[0],
        future: settled.future.slice(1),
      };
    }
    default:
      return history;
  }
};

// Undo history for the filter settings. `change` is one step; slider ticks go
// through `drag` and become one step when `release` runs.
const useSettingsHistory = (initialSettings) => {
  const [history, dispatch] = useReducer(
    historyReducer,
    initialSettings,
    createHistory,
  );

  return {
    settings: history.present,
    canUndo: history.past.length > 0 || history.dragStart !== null,
    canRedo: history.future.length > 0,
    change: useCallback((settings) => dispatch({ type: "change", settings }), []),
    drag: useCallback((settings) => dispatch({ type: "drag", settings }), []),
    release: useCallback(() => dispatch({ type: "release" }), []),
    undo: useCallback(() => dispatch({ type: "undo" }), []),
    redo: useCallback(() => dispatch({ type: "redo" }), []),
  };
};

export default useSettingsHistory;
