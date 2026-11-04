"use client";
import React, { useId } from "react";

const SLIDER_CONTROLS = [
  { key: "grayscale", label: "Grayscale", max: 100, toPercent: (value) => value },
  { key: "blur", label: "Blur", max: 10, toPercent: (value) => value * 10 },
  {
    key: "brightness",
    label: "Brightness",
    max: 200,
    toPercent: (value) => Math.min(100, value / 2),
  },
];

const Switch = ({ label, checked, onToggle }) => (
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

const ControlsPanel = ({ settings, onSettingsChange }) => {
  const panelId = useId();
  const updateSetting = (key, changes) => {
    onSettingsChange({ ...settings, [key]: { ...settings[key], ...changes } });
  };

  const toggleFlip = () => {
    onSettingsChange({
      ...settings,
      flip: {
        enabled: !settings.flip.enabled,
        value: settings.flip.value === 1 ? -1 : 1,
      },
    });
  };

  return (
    <ul className="space-y-3">
      <li className="flex items-center justify-between rounded-2xl bg-[var(--bg-main)] px-4 py-3">
        <span className="text-main text-sm font-semibold uppercase">Flip</span>
        <Switch
          label="Flip"
          checked={settings.flip.enabled}
          onToggle={toggleFlip}
        />
      </li>

      {SLIDER_CONTROLS.map(({ key, label, max, toPercent }) => {
        const { enabled, value } = settings[key];
        const sliderId = `${panelId}-${key}`;

        return (
          <li key={key} className="space-y-3 rounded-2xl bg-[var(--bg-main)] px-4 py-3">
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
                  {Math.round(toPercent(value))}%
                </output>
                <Switch
                  label={`Enable ${label}`}
                  checked={enabled}
                  onToggle={() => updateSetting(key, { enabled: !enabled })}
                />
              </div>
            </div>
            <input
              id={sliderId}
              type="range"
              min="0"
              max={max}
              value={value}
              disabled={!enabled}
              onChange={(event) =>
                updateSetting(key, { value: Number(event.target.value) })
              }
              style={{ "--fill": `${(value / max) * 100}%` }}
              className="slider w-full cursor-pointer"
            />
          </li>
        );
      })}
    </ul>
  );
};

export default ControlsPanel;
