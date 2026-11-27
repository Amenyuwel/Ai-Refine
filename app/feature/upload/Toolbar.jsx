"use client";
import React from "react";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import FlipIcon from "@mui/icons-material/Flip";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { toggleFlip } from "@/feature/upload/ControlsPanel";
import Download from "@/feature/upload/Download";
import { greenButtonClass } from "@/feature/upload/buttonStyles";

const HISTORY_BUTTONS = [
  { label: "Undo", Icon: UndoIcon, action: "undo", canRun: "canUndo" },
  { label: "Redo", Icon: RedoIcon, action: "redo", canRun: "canRedo" },
];

const toolbarButtonClass =
  "flex cursor-pointer flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-xs font-medium sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] sm:px-4";

const inactiveButtonClass =
  "text-main transition-colors hover:bg-[var(--bg-main)]";

const Toolbar = ({
  uploadedImages,
  previewImage,
  settings,
  onSettingsChange,
  history,
  isAugmentOpen,
  onAugmentToggle,
  augmentPanelId,
}) => (
  <div className="mx-auto w-full max-w-md px-2 pt-2 sm:max-w-2xl sm:px-4">
    <div
      data-tour="toolbar"
      className="flex flex-wrap items-center justify-center gap-1 rounded-3xl bg-white p-2 shadow-lg sm:rounded-full"
    >
      <button
        type="button"
        aria-expanded={isAugmentOpen}
        aria-controls={isAugmentOpen ? augmentPanelId : undefined}
        onClick={onAugmentToggle}
        className={`${toolbarButtonClass} ${isAugmentOpen ? greenButtonClass : inactiveButtonClass}`}
      >
        <AutoFixHighIcon fontSize="small" aria-hidden="true" />
        Augment
      </button>
      <button
        type="button"
        aria-pressed={settings.flip.enabled}
        onClick={() => onSettingsChange(toggleFlip(settings))}
        className={`${toolbarButtonClass} ${settings.flip.enabled ? greenButtonClass : inactiveButtonClass}`}
      >
        <FlipIcon fontSize="small" aria-hidden="true" />
        Flip
      </button>
      {HISTORY_BUTTONS.map(({ label, Icon, action, canRun }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          disabled={!history[canRun]}
          onClick={history[action]}
          className={`${toolbarButtonClass} ${inactiveButtonClass} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
        >
          <Icon fontSize="small" aria-hidden="true" />
        </button>
      ))}
      <Download
        uploadedImages={uploadedImages}
        previewImage={previewImage}
        settings={settings}
      />
    </div>
  </div>
);

export default Toolbar;
