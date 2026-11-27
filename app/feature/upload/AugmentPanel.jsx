"use client";
import React, { useId, useState } from "react";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ControlsPanel from "@/feature/upload/ControlsPanel";
import RandomVariants from "@/feature/upload/RandomVariants";
import AugmentTabs from "@/feature/upload/AugmentTabs";
import ConfirmResetDialog from "@/feature/upload/ConfirmResetDialog";
import { outlinedButtonClass } from "@/feature/upload/buttonStyles";
import { useImageContext } from "@/context/ImageContext";
import {
  MAX_CLASS_NAME_LENGTH,
  sanitizeClassName,
} from "@/utils/exportFileNames";
import {
  DEFAULT_SETTINGS,
  VARIANT_COUNT_DEFAULT,
  areRangesDefault,
  disableEffects,
} from "@/utils/filterSettings";

const isDefaultSettings = (settings) =>
  JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS);

const AugmentPanel = ({ id, style, ...controlsProps }) => {
  const { settings, onSettingsChange } = controlsProps;
  const {
    uploadedImages,
    className,
    setClassName,
    randomize,
    setRandomize,
    ranges,
    setRange,
    variantCount,
    setVariantCount,
    seed,
    setSeed,
    resetRandomVariants,
  } = useImageContext();
  const isDefaultRandomVariants =
    !randomize &&
    seed === null &&
    variantCount === VARIANT_COUNT_DEFAULT &&
    areRangesDefault(ranges);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const classFieldId = useId();
  const helperId = useId();
  const cleanedClassName = sanitizeClassName(className);
  const showCleanedName = cleanedClassName && cleanedClassName !== className;
  const showSingleImageHint = !randomize && uploadedImages.length === 1;

  // Each tab starts with every effect off, so the user picks them again there.
  // Setting and tab change together; Undo brings the effects back.
  const handleRandomizeChange = (nextRandomize) => {
    if (nextRandomize === randomize) return;
    onSettingsChange(disableEffects(settings));
    setRandomize(nextRandomize);
  };

  // One history step, so Undo brings the previous settings back
  const confirmReset = () => {
    onSettingsChange(DEFAULT_SETTINGS);
    resetRandomVariants();
    setIsConfirmingReset(false);
  };

  return (
    <div
      id={id}
      style={style}
      role="region"
      aria-label="Augment"
      className="flex h-[55%] w-full max-w-md shrink-0 flex-col overflow-y-auto rounded-3xl bg-white p-3 pb-1.5 shadow-lg [scrollbar-gutter:stable] md:order-last md:h-full md:w-80 md:translate-x-[calc(var(--panel-shift)*-1)]"
    >
      <div className="mb-1.5">
        <div className="flex items-center gap-2">
          <label
            htmlFor={classFieldId}
            className="text-main shrink-0 text-sm font-semibold"
          >
            Class name
          </label>
          <input
            id={classFieldId}
            type="text"
            value={className}
            placeholder="Class, e.g. duck"
            maxLength={MAX_CLASS_NAME_LENGTH}
            aria-describedby={helperId}
            onChange={(event) => setClassName(event.target.value)}
            className="text-main min-w-0 flex-1 rounded-lg border border-[var(--primary)] bg-white px-3 py-1 text-sm placeholder:text-[color-mix(in_srgb,var(--text-main)_70%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]"
          />
        </div>
        <p
          id={helperId}
          className="text-main sr-only mt-0.5 text-xs leading-tight opacity-70 [@media(min-height:1000px)]:not-sr-only"
        >
          Optional. Images go in a folder with this name in the zip.
        </p>
        {showCleanedName && (
          <p className="text-main mt-1 text-xs">
            Folder name: <strong>{cleanedClassName}</strong>
          </p>
        )}
      </div>
      <AugmentTabs
        randomize={randomize}
        onRandomizeChange={handleRandomizeChange}
        actions={
          <button
            type="button"
            aria-label="Reset"
            title="Reset"
            disabled={isDefaultSettings(settings) && isDefaultRandomVariants}
            aria-haspopup="dialog"
            onClick={() => setIsConfirmingReset(true)}
            className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full ${outlinedButtonClass}`}
          >
            <RestartAltIcon fontSize="small" aria-hidden="true" />
          </button>
        }
      >
        {showSingleImageHint && (
          <p role="status" className="text-main px-1 text-xs">
            One image? Randomize makes many variants.
          </p>
        )}
        <ControlsPanel
          {...controlsProps}
          randomize={randomize}
          ranges={ranges}
          onRangeChange={setRange}
        />
        <RandomVariants
          randomize={randomize}
          variantCount={variantCount}
          onVariantCountChange={setVariantCount}
          seed={seed}
          onSeedChange={setSeed}
        />
      </AugmentTabs>
      <ConfirmResetDialog
        open={isConfirmingReset}
        onCancel={() => setIsConfirmingReset(false)}
        onConfirm={confirmReset}
      />
    </div>
  );
};

export default AugmentPanel;
