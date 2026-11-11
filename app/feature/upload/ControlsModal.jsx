"use client";
import HeroPattern from "components/HeroPattern";
import React, { useEffect, useId, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import ControlsPanel from "@/feature/upload/ControlsPanel";

const ControlsModal = ({
  isOpen,
  type,
  onClose,
  onSettingsChange,
  settings,
  isInline = false,
}) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const headingId = useId();
  const isModal = isOpen && !isInline;

  useEffect(() => {
    if (!isModal) return;

    // The opener is whatever has focus when the modal opens; every close path returns to it.
    const opener = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current.querySelectorAll(
        "button:not([disabled]), input:not([disabled]), [href]",
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement;
      const focusIsOutside = !dialogRef.current.contains(active);

      if (event.shiftKey && (active === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      opener?.focus();
    };
  }, [isModal, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      {...(isModal && {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": headingId,
      })}
      className={`${
        isInline
          ? "relative w-80 flex-col rounded-3xl bg-white p-6 shadow-lg"
          : "bg-opacity-50 pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      }`}
      onClick={
        isInline
          ? undefined
          : (e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }
      }
      style={isInline ? {} : { pointerEvents: "auto" }}
    >
      <div
        className={
          isInline
            ? "w-full"
            : "pointer-events-auto relative h-auto max-h-[80vh] w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:max-h-[85vh] sm:max-w-sm sm:rounded-3xl sm:p-6 md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:w-[20%]"
        }
      >
        {!isInline && (
          <button
            ref={closeButtonRef}
            title="Close"
            aria-label="Close"
            className="absolute top-2 right-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 sm:top-3 sm:right-3"
            onClick={onClose}
          >
            <FaTimes size={16} className="sm:h-5 sm:w-5" />
          </button>
        )}
        <h2
          id={headingId}
          className={`${
            isInline ? "" : "pr-8"
          } text-lg font-bold text-gray-800 sm:text-xl md:text-2xl lg:text-3xl`}
        >
          CONTROLS
        </h2>
        <p
          className={`${
            isInline ? "mb-6" : "mt-2 mb-3 sm:mb-4"
          } text-left text-xs leading-relaxed text-gray-500 sm:text-sm`}
        >
          Click the toggle buttons to enable modifications, then use the sliders
          to adjust their intensity.
        </p>

        <div className={isInline ? "" : "mt-3 sm:mt-4"}>
          <ControlsPanel
            settings={settings}
            onSettingsChange={onSettingsChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;
