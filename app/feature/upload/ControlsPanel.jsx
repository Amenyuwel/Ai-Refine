"use client";
import React, { useId } from "react";
import EffectRow from "@/feature/upload/EffectRow";

import {
  BLUR_MAX,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  ROTATE_MAX,
  ROTATE_MIN,
  ZOOM_MAX,
  ZOOM_MIN,
} from "@/utils/filterSettings";

// `format` shows the value in the unit the filter really uses.
const SLIDER_CONTROLS = [
  {
    key: "grayscale",
    group: "color",
    label: "Grayscale",
    min: 0,
    max: 100,
    format: (value) => `${value}%`,
  },
  {
    key: "blur",
    group: "color",
    label: "Blur",
    min: 0,
    max: BLUR_MAX,
    format: (value) => `${(value / 10).toFixed(1)}%`,
    hint: "Percent of the image's shorter side",
  },
  {
    key: "brightness",
    group: "color",
    label: "Brightness",
    min: BRIGHTNESS_MIN,
    max: BRIGHTNESS_MAX,
    format: (value) => `${value}%`,
    hint: "100% is unchanged",
  },
  {
    key: "rotate",
    group: "position",
    label: "Rotate",
    min: ROTATE_MIN,
    max: ROTATE_MAX,
    format: (value) => `${value}°`,
    hint: "Degrees clockwise; the image is enlarged to fill the frame",
  },
  {
    key: "zoom",
    group: "position",
    label: "Zoom",
    min: ZOOM_MIN,
    max: ZOOM_MAX,
    format: (value) => `${value}%`,
    hint: "100% is unchanged",
  },
];

// The panel shows the groups top to bottom in this order.
const CONTROL_GROUPS = [
  { id: "color", heading: "Color and detail" },
  { id: "position", heading: "Position and size" },
];

// Flip stores its direction in `value` so the preview and export read it like the other settings.
export const toggleFlip = (settings) => ({
  ...settings,
  flip: {
    enabled: !settings.flip.enabled,
    value: settings.flip.value === 1 ? -1 : 1,
  },
});

// One row per filter setting. In randomize mode each row shows a min-max range.
const ControlsPanel = ({
  settings,
  onSettingsChange,
  onSliderDrag,
  onSliderRelease,
  randomize,
  ranges,
  onRangeChange,
}) => {
  const panelId = useId();
  const withChanges = (key, changes) => ({
    ...settings,
    [key]: { ...settings[key], ...changes },
  });

  return (
    // Spare panel height is shared by row count, so every row grows the same amount
    <div
      style={{ flexGrow: SLIDER_CONTROLS.length }}
      className="flex flex-col gap-1"
    >
      {CONTROL_GROUPS.map(({ id, heading }) => {
        const controls = SLIDER_CONTROLS.filter(({ group }) => group === id);
        return (
          <section
            key={id}
            aria-labelledby={`${panelId}-${id}`}
            style={{ flexGrow: controls.length }}
            className="flex flex-col"
          >
            <h2
              id={`${panelId}-${id}`}
              // Short screens have no room for a heading row; it stays for screen readers
              className="text-main sr-only px-1 text-xs leading-tight font-semibold tracking-wide uppercase opacity-70 [@media(min-height:801px)]:not-sr-only [@media(min-height:801px)]:mt-1 [@media(min-height:801px)]:mb-2"
            >
              {heading}
            </h2>
            <ul className="flex flex-1 flex-col gap-1.5">
              {controls.map((control) => (
                <EffectRow
                  key={control.key}
                  control={control}
                  setting={settings[control.key]}
                  range={ranges[control.key]}
                  randomize={randomize}
                  onToggle={() =>
                    onSettingsChange(
                      withChanges(control.key, {
                        enabled: !settings[control.key].enabled,
                      }),
                    )
                  }
                  onValueChange={(value) =>
                    onSliderDrag(withChanges(control.key, { value }))
                  }
                  onValueCommit={onSliderRelease}
                  onRangeChange={(bounds) => onRangeChange(control.key, bounds)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default ControlsPanel;
