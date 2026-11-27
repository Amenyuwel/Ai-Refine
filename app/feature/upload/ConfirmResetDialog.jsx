"use client";
import React, { useId } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  greenButtonClass,
  outlinedButtonClass,
} from "@/feature/upload/buttonStyles";

const ConfirmResetDialog = ({ open, onCancel, onConfirm }) => {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id={titleId} className="text-main !text-base">
        Reset all effects?
      </DialogTitle>
      <DialogContent>
        <p id={descriptionId} className="text-main text-sm">
          All effects and settings in this panel go back to their defaults.
        </p>
      </DialogContent>
      <DialogActions>
        {/* Cancel takes focus first so Enter or Space cannot confirm by accident */}
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          className={`h-10 cursor-pointer rounded-full px-4 text-sm font-medium ${outlinedButtonClass}`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`h-10 cursor-pointer rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] ${greenButtonClass}`}
        >
          Reset
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmResetDialog;
