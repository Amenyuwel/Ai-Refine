"use client";
import React from "react";

// Two range inputs stacked on one track. Each handle stops at the other, so
// min never exceeds max.
const RangeSlider = ({
  idPrefix,
  label,
  min,
  max,
  low,
  high,
  format,
  disabled,
  onChange,
}) => {
  const percentOf = (value) => ((value - min) / (max - min)) * 100;
  const sharedProps = {
    min,
    max,
    disabled,
    className: "slider cursor-pointer",
  };

  return (
    <div
      className="slider-dual"
      style={{ "--low": `${percentOf(low)}%`, "--high": `${percentOf(high)}%` }}
    >
      <input
        {...sharedProps}
        type="range"
        id={`${idPrefix}-min`}
        aria-label={`${label} minimum`}
        aria-valuetext={format(low)}
        value={low}
        onChange={(event) =>
          onChange({
            min: Math.min(Number(event.target.value), high),
            max: high,
          })
        }
      />
      <input
        {...sharedProps}
        type="range"
        id={`${idPrefix}-max`}
        aria-label={`${label} maximum`}
        aria-valuetext={format(high)}
        value={high}
        onChange={(event) =>
          onChange({ min: low, max: Math.max(Number(event.target.value), low) })
        }
      />
    </div>
  );
};

export default RangeSlider;
