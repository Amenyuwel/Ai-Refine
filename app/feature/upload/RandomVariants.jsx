"use client";
import React, { useId, useState } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  greenButtonClass,
  outlinedButtonClass,
  rowSizeClass,
} from "@/feature/upload/buttonStyles";
import { VARIANT_COUNT_MAX, VARIANT_COUNT_MIN } from "@/utils/filterSettings";

const WHOLE_NUMBER = /^\d+$/;
// The count also accepts a leading minus so a negative clamps to the minimum
const SIGNED_WHOLE_NUMBER = /^-?\d+$/;

const fieldClass =
  "text-main rounded-lg border border-[var(--primary)] bg-white px-2 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]";

const dialogButtonClass =
  "h-10 cursor-pointer rounded-full px-4 text-sm font-medium";

// Same shape as an effect row, so every row of the panel looks alike.
const SettingRow = ({ label, value, onOpen }) => (
  <button
    type="button"
    aria-haspopup="dialog"
    onClick={onOpen}
    className={`${rowSizeClass} group flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl bg-[var(--bg-main)] px-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]`}
  >
    <span className="text-main text-sm font-semibold">{label}</span>
    <span className="flex items-center gap-1">
      <span className="text-main rounded-full bg-white px-2 py-0.5 text-sm font-medium whitespace-nowrap tabular-nums">
        {value}
      </span>
      <ChevronRightIcon
        fontSize="small"
        aria-hidden="true"
        data-opens-dialog-indicator=""
        className="text-main shrink-0 opacity-60 group-hover:opacity-100"
      />
    </span>
  </button>
);

// Edits a draft of the saved settings. It is mounted only while open, so each
// opening starts from the last saved values and Cancel needs no cleanup.
const RandomSettingsDialog = ({ variantCount, seed, onSave, onCancel }) => {
  const titleId = useId();
  const countId = useId();
  const seedId = useId();
  const seedHelpId = useId();
  // Text, because a field being edited may be empty, which the count cannot be
  const [countText, setCountText] = useState(String(variantCount));
  const [seedText, setSeedText] = useState(seed === null ? "" : String(seed));
  const isDraftValid = countText !== "";

  const handleCountChange = (event) => {
    const text = event.target.value;
    if (!SIGNED_WHOLE_NUMBER.test(text)) {
      setCountText("");
      return;
    }
    const clamped = Math.min(
      Math.max(Number(text), VARIANT_COUNT_MIN),
      VARIANT_COUNT_MAX,
    );
    setCountText(String(clamped));
  };

  // Only whole numbers get through, so a typed letter or dot is dropped
  const handleSeedChange = (event) => {
    const text = event.target.value;
    const isAccepted =
      text === "" ||
      (WHOLE_NUMBER.test(text) && Number.isSafeInteger(Number(text)));
    if (isAccepted) setSeedText(text);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isDraftValid) return;
    onSave({
      variantCount: Number(countText),
      seed: seedText === "" ? null : Number(seedText),
    });
  };

  return (
    <Dialog
      open
      onClose={onCancel}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { component: "form", onSubmit: handleSubmit } }}
    >
      <DialogTitle id={titleId} className="text-main !text-base">
        Random settings
      </DialogTitle>
      <DialogContent>
        <p className="text-main mb-3 text-xs opacity-70">
          Each effect is a range. The preview shows the middle of each range.
        </p>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label htmlFor={countId} className="text-main text-sm font-semibold">
            Variants per image
          </label>
          <input
            id={countId}
            type="number"
            min={VARIANT_COUNT_MIN}
            max={VARIANT_COUNT_MAX}
            step={1}
            value={countText}
            onChange={handleCountChange}
            className={`${fieldClass} w-20`}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={seedId} className="text-main text-sm font-semibold">
            Seed
          </label>
          <input
            id={seedId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Random"
            value={seedText}
            aria-describedby={seedHelpId}
            onChange={handleSeedChange}
            className={`${fieldClass} w-32 min-w-0`}
          />
        </div>
        <p id={seedHelpId} className="text-main mt-1 text-xs opacity-70">
          Optional. Same seed and same images give the same dataset.
        </p>
      </DialogContent>
      <DialogActions>
        <button
          type="button"
          onClick={onCancel}
          className={`${dialogButtonClass} ${outlinedButtonClass}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isDraftValid}
          className={`${dialogButtonClass} ${greenButtonClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none`}
        >
          Save
        </button>
      </DialogActions>
    </Dialog>
  );
};

const RandomVariants = ({
  randomize,
  variantCount,
  onVariantCountChange,
  seed,
  onSeedChange,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (draft) => {
    onVariantCountChange(draft.variantCount);
    onSeedChange(draft.seed);
    setIsDialogOpen(false);
  };

  // Even an empty block would add a flex gap under the last row of the Simple tab
  if (!randomize) return null;

  return (
    <div style={{ flexGrow: 2 }} className="flex flex-col gap-1.5">
      {/* The notice slot keeps its height, so a notice appearing moves nothing */}
      <div role="status" className="min-h-12 px-1">
        <p className="text-main text-xs font-medium">
          Randomize is on but no augmentation is enabled. Variants will be
          identical copies of the originals.
        </p>
      </div>
      <SettingRow
        label="Random settings"
        value={`${variantCount} per image`}
        onOpen={() => setIsDialogOpen(true)}
      />
      {isDialogOpen && (
        <RandomSettingsDialog
          variantCount={variantCount}
          seed={seed}
          onSave={handleSave}
          onCancel={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default RandomVariants;
