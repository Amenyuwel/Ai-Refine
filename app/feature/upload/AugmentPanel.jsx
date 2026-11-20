"use client";
import React, { useId } from "react";
import ControlsPanel from "@/feature/upload/ControlsPanel";
import { outlinedButtonClass } from "@/feature/upload/buttonStyles";
import { useImageContext } from "@/context/ImageContext";
import {
  MAX_CLASS_NAME_LENGTH,
  sanitizeClassName,
} from "@/utils/exportFileNames";
import { DEFAULT_SETTINGS } from "@/utils/filterSettings";

const isDefaultSettings = (settings) =>
  JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS);

const AugmentPanel = ({ id, style, ...controlsProps }) => {
  const { settings, onSettingsChange } = controlsProps;
  const { className, setClassName } = useImageContext();
  const classFieldId = useId();
  const helperId = useId();
  const cleanedClassName = sanitizeClassName(className);
  const showCleanedName = cleanedClassName && cleanedClassName !== className;

  return (
    <div
      id={id}
      style={style}
      role="region"
      aria-label="Augment"
      className="compact-controls max-h-[55%] w-full max-w-md shrink-0 overflow-y-auto rounded-3xl bg-white p-3 shadow-lg md:order-last md:max-h-none md:w-80 md:translate-x-[calc(var(--panel-shift)*-1)]"
    >
      <ControlsPanel {...controlsProps} />
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor={classFieldId}
            className="text-main shrink-0 text-sm font-medium"
          >
            Class name
          </label>
          <input
            id={classFieldId}
            type="text"
            value={className}
            maxLength={MAX_CLASS_NAME_LENGTH}
            aria-describedby={helperId}
            onChange={(event) => setClassName(event.target.value)}
            className="text-main min-w-0 flex-1 rounded-lg border border-[var(--primary)] bg-white px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]"
          />
        </div>
        <p
          id={helperId}
          className="text-main mt-0.5 text-xs leading-tight opacity-70"
        >
          Optional. Images go in a folder with this name in the zip.
        </p>
        {showCleanedName && (
          <p className="text-main mt-1 text-xs">
            Folder name: <strong>{cleanedClassName}</strong>
          </p>
        )}
      </div>
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
