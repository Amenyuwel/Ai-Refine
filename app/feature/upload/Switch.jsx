"use client";
import React from "react";

// The button is the touch target (44px tall on phones); the track inside is
// what the eye sees.
export const Switch = ({ label, checked, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onToggle}
    className="flex w-12 shrink-0 cursor-pointer items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]"
  >
    <span
      className={`block h-7 w-12 rounded-full p-0.5 transition-colors ${
        checked ? "bg-[var(--primary)]" : "bg-gray-300"
      }`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </span>
  </button>
);
