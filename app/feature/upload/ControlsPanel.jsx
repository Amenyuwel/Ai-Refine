"use client";
import React, { useId } from "react";

import {
  BLUR_MAX,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
} from "@/utils/filterSettings";

// `format` shows the value in the unit the filter really uses.
const SLIDER_CONTROLS = [
  {
    key: "grayscale",
    label: "Grayscale",
    min: 0,
    max: 100,
    format: (value) => `${value}%`,
  },
  {
    key: "blur",
    label: "Blur",
    min: 0,
    max: BLUR_MAX,
    format: (value) => `${(value / 10).toFixed(1)}%`,
    hint: "Percent of the image's shorter side",
  },
  {
    key: "brightness",
    label: "Brightness",
    min: BRIGHTNESS_MIN,
    max: BRIGHTNESS_MAX,
    format: (value) => `${value}%`,
    hint: "100% is unchanged",
  },
];

export const Switch = ({ label, checked, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onToggle}
    className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] ${
      checked ? "bg-[var(--primary)]" : "bg-gray-300"
    }`}
  >
    <span
      className={`block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

// Flip stores its direction in `value` so the preview and export read it like the other settings.
export const toggleFlip = (settings) => ({
  ...settings,
  flip: {
    enabled: !settings.flip.enabled,
    value: settings.flip.value === 1 ? -1 : 1,
  },
});

// Renders the enable switch and slider for every filter setting.
const ControlsPanel = ({
  settings,
  onSettingsChange,
  onSliderDrag,
  onSliderRelease,
}) => {
  const panelId = useId();
  const withChanges = (key, changes) => ({
    ...settings,
    [key]: { ...settings[key], ...changes },
  });

  return (
    <ul className="space-y-2">
      {SLIDER_CONTROLS.map(({ key, label, min, max, format, hint }) => {
        const { enabled, value } = settings[key];
        const sliderId = `${panelId}-${key}`;

        return (
          <li
            key={key}
            className="space-y-1.5 rounded-2xl bg-[var(--bg-main)] px-3 py-2"
          >
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor={sliderId}
                className="text-main text-sm font-semibold uppercase"
              >
                {label}
              </label>
              <div className="flex items-center gap-3">
                <output
                  htmlFor={sliderId}
                  className={`min-w-12 rounded-full bg-white px-2 py-0.5 text-center text-sm font-medium tabular-nums ${
                    enabled ? "text-main" : "text-gray-500"
                  }`}
                >
                  {format(value)}
                </output>
                <Switch
                  label={`Enable ${label}`}
                  checked={enabled}
                  onToggle={() =>
                    onSettingsChange(withChanges(key, { enabled: !enabled }))
                  }
                />
              </div>
            </div>
            <input
              id={sliderId}
              type="range"
              min={min}
              max={max}
              value={value}
              disabled={!enabled}
              aria-valuetext={format(value)}
              onChange={(event) =>
                onSliderDrag(
                  withChanges(key, { value: Number(event.target.value) }),
                )
              }
              onPointerUp={onSliderRelease}
              onKeyUp={onSliderRelease}
              onBlur={onSliderRelease}
              style={{ "--fill": `${((value - min) / (max - min)) * 100}%` }}
              className="slider w-full cursor-pointer"
            />
            {hint && (
              // Hints take a row per slider; they show only when the screen is tall enough
              <p className="sr-only text-xs text-gray-500 [@media(min-height:1000px)]:not-sr-only">
                {hint}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ControlsPanel;
