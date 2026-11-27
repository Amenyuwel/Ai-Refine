"use client";
import React, { useId, useRef } from "react";

const TABS = [
  { id: "simple", label: "Simple", randomize: false },
  { id: "random", label: "Random", randomize: true },
];

const TAB_KEYS = {
  ArrowRight: 1,
  ArrowLeft: -1,
};

// Tab 1 is the fixed-value mode, tab 2 the randomized one. The tab follows the
// `randomize` flag, so there is no second copy of the mode to keep in sync.
// `children` is the tabpanel content; `actions` sits at the end of the tab row.
const AugmentTabs = ({ randomize, onRandomizeChange, actions, children }) => {
  const baseId = useId();
  const tabRefs = useRef([]);
  const activeIndex = randomize ? 1 : 0;

  const selectTab = (index) => {
    onRandomizeChange(TABS[index].randomize);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Home") selectTab(0);
    else if (event.key === "End") selectTab(TABS.length - 1);
    else if (event.key in TAB_KEYS) {
      selectTab(
        (activeIndex + TAB_KEYS[event.key] + TABS.length) % TABS.length,
      );
    } else return;
    event.preventDefault();
  };

  return (
    <>
      <div className="mb-1 flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Augmentation mode"
          onKeyDown={handleKeyDown}
          className="flex min-w-0 flex-1 gap-1 rounded-full bg-[var(--bg-main)] p-0.5"
        >
          {TABS.map(({ id, label }, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${baseId}-${id}-tab`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(index)}
                className={`text-main h-10 flex-1 cursor-pointer rounded-full px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] ${
                  selected ? "bg-white shadow-sm" : "opacity-70"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {actions}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        className="flex flex-1 flex-col gap-2"
        aria-labelledby={`${baseId}-${TABS[activeIndex].id}-tab`}
      >
        {children}
      </div>
    </>
  );
};

export default AugmentTabs;
