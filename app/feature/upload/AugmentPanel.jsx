"use client";
import React from "react";
import ControlsPanel from "@/feature/upload/ControlsPanel";
import { outlinedButtonClass } from "@/feature/upload/buttonStyles";
import { DEFAULT_SETTINGS } from "@/utils/filterSettings";

const isDefaultSettings = (settings) =>
  JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS);

const AugmentPanel = ({ id, style, ...controlsProps }) => {
  const { settings, onSettingsChange } = controlsProps;

  return (
    <div
      id={id}
      style={style}
      role="region"
      aria-label="Augment"
      className="compact-controls max-h-[55%] w-full max-w-md shrink-0 overflow-y-auto rounded-3xl bg-white p-3 shadow-lg md:order-last md:max-h-none md:w-80 md:translate-x-[calc(var(--panel-shift)*-1)]"
    >
      <ControlsPanel {...controlsProps} />
      {/* One history step, so Undo brings the previous settings back */}
      <button
        type="button"
        disabled={isDefaultSettings(settings)}
        onClick={() => onSettingsChange(DEFAULT_SETTINGS)}
        className={`mt-2 w-full cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium ${outlinedButtonClass}`}
      >
        Reset
      </button>
    </div>
  );
};

export default AugmentPanel;
