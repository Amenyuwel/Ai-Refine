"use client";
import React, { useId, useState } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Popover from "@mui/material/Popover";
import RangeSlider from "@/feature/upload/RangeSlider";
import { Switch } from "@/feature/upload/Switch";
import {
  outlinedButtonClass,
  rowSizeClass,
} from "@/feature/upload/buttonStyles";

const focusRingClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]";

// The popover holds the only slider for this effect: one handle in Simple mode,
// a min-max pair in Random mode.
const EffectSlider = ({
  control,
  setting,
  range,
  randomize,
  sliderId,
  onValueChange,
  onValueCommit,
  onRangeChange,
}) => {
  const { label, min, max, format } = control;
  if (randomize) {
    return (
      <RangeSlider
        idPrefix={sliderId}
        label={label}
        min={min}
        max={max}
        low={range.min}
        high={range.max}
        format={format}
        disabled={!setting.enabled}
        onChange={onRangeChange}
      />
    );
  }
  return (
    <input
      id={sliderId}
      type="range"
      min={min}
      max={max}
      value={setting.value}
      disabled={!setting.enabled}
      aria-valuetext={format(setting.value)}
      onChange={(event) => onValueChange(Number(event.target.value))}
      onPointerUp={onValueCommit}
      onKeyUp={onValueCommit}
      onBlur={onValueCommit}
      style={{
        "--fill": `${((setting.value - min) / (max - min)) * 100}%`,
      }}
      className="slider w-full cursor-pointer"
    />
  );
};

// One effect as a fixed-height row: a button that shows the value and opens the
// slider, and the on/off switch. Nothing in the row changes size when the
// effect is switched, so the panel never shifts.
const EffectRow = ({
  control,
  setting,
  range,
  randomize,
  onToggle,
  onValueChange,
  onValueCommit,
  onRangeChange,
}) => {
  const { label, format, hint } = control;
  const { enabled, value } = setting;
  const sliderId = useId();
  const titleId = useId();
  const [anchorElement, setAnchorElement] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [previousRandomize, setPreviousRandomize] = useState(randomize);
  // Switching Simple/Random changes what the slider shows, so close it rather
  // than leave it open over the other tab.
  if (previousRandomize !== randomize) {
    setPreviousRandomize(randomize);
    setIsOpen(false);
  }
  const readout = randomize
    ? `${format(range.min)} – ${format(range.max)}`
    : format(value);

  // Only a direct click on the switch opens the popover. Reset, undo and loaded
  // state change `enabled` without going through here.
  const handleSwitchToggle = () => {
    onToggle();
    setIsOpen(!enabled);
  };

  return (
    <li
      className={`${rowSizeClass} flex items-center gap-1 rounded-2xl bg-[var(--bg-main)] pr-2 pl-1 ${
        enabled ? "ring-2 ring-[var(--primary)]" : ""
      }`}
    >
      <button
        ref={setAnchorElement}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className={`group flex h-full min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-xl px-2 text-left ${focusRingClass}`}
      >
        <span className="text-main text-sm font-semibold">{label}</span>
        <span className="flex items-center gap-1">
          <span
            className={`rounded-full bg-white px-2 py-0.5 text-sm font-medium whitespace-nowrap tabular-nums ${
              enabled ? "text-main" : "text-gray-500"
            }`}
          >
            {readout}
          </span>
          <ChevronRightIcon
            fontSize="small"
            aria-hidden="true"
            data-opens-dialog-indicator=""
            className="text-main shrink-0 opacity-60 group-hover:opacity-100"
          />
        </span>
      </button>
      <Switch
        label={`Enable ${label}`}
        checked={enabled}
        onToggle={handleSwitchToggle}
      />
      <Popover
        open={isOpen}
        anchorEl={anchorElement}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-labelledby": titleId,
            className: "w-72 max-w-[calc(100vw-2rem)] !rounded-2xl p-4",
          },
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <label
            id={titleId}
            htmlFor={randomize ? undefined : sliderId}
            className="text-main text-sm font-semibold"
          >
            {label}
          </label>
          <output
            htmlFor={randomize ? undefined : sliderId}
            className="text-main text-sm font-medium whitespace-nowrap tabular-nums"
          >
            {readout}
          </output>
        </div>
        <EffectSlider
          control={control}
          setting={setting}
          range={range}
          randomize={randomize}
          sliderId={sliderId}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
          onRangeChange={onRangeChange}
        />
        {hint && <p className="text-main mt-2 text-xs opacity-70">{hint}</p>}
        {!enabled && (
          <p className="text-main mt-2 text-xs font-medium">
            This effect is off. Switch it on to change the value.
          </p>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={`mt-3 h-10 w-full cursor-pointer rounded-full text-sm font-medium ${outlinedButtonClass}`}
        >
          Done
        </button>
      </Popover>
    </li>
  );
};

export default EffectRow;
