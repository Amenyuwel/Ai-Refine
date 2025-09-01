"use client";
import HeroPattern from "components/HeroPattern";
import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const ControlsModal = ({
  isOpen,
  type,
  onClose,
  onSettingsChange,
  settings,
}) => {
  if (!isOpen) return null;

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Toggle Flip
  const toggleFlip = () => {
    const newSettings = {
      ...localSettings,
      flip: {
        enabled: !localSettings.flip.enabled,
        value: localSettings.flip.value === 1 ? -1 : 1,
      },
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  // Toggle settings (Grayscale, Blur, Brightness)
  const toggleSetting = (key) => {
    const newSettings = {
      ...localSettings,
      [key]: { ...localSettings[key], enabled: !localSettings[key].enabled },
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings); // Update parent here
  };

  // Update slider value (Grayscale, Blur, Brightness)
  const updateSlider = (key, value) => {
    const newSettings = {
      ...localSettings,
      [key]: { ...localSettings[key], value },
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div
      className="bg-opacity-50 pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{ pointerEvents: "auto" }}
    >
      <div className="pointer-events-auto relative h-auto max-h-[80vh] w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:max-h-[85vh] sm:max-w-sm sm:rounded-3xl sm:p-6 md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:w-[20%]">
        <button
          title="Close"
          className="absolute top-2 right-2 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 sm:top-3 sm:right-3"
          onClick={onClose}
        >
          <FaTimes size={16} className="sm:h-5 sm:w-5" />
        </button>
        <h2 className="pr-8 text-lg font-bold text-gray-800 sm:text-xl md:text-2xl lg:text-3xl">
          CONTROLS
        </h2>
        <p className="mt-2 text-left text-xs leading-relaxed text-gray-500 sm:text-sm">
          Click the toggle buttons to enable modifications, then use the sliders
          to adjust their intensity.
        </p>

        <div className="mt-3 space-y-4 sm:mt-4 sm:space-y-5 md:space-y-6">
          {/* Flip Toggle */}
          <div className="flex items-center justify-between py-1">
            <p className="text-main font-sans text-sm font-semibold uppercase sm:text-base md:text-base">
              Flip
            </p>
            <button
              onClick={toggleFlip}
              className={`relative h-6 w-12 rounded-full p-0.5 transition-colors sm:h-7 sm:w-14 md:h-8 md:w-16 ${
                localSettings.flip.enabled ? "bg-[#79c99e]" : "bg-gray-300"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out sm:h-6 sm:w-6 md:h-7 md:w-7 ${
                  localSettings.flip.enabled
                    ? "translate-x-6 sm:translate-x-7 md:translate-x-8"
                    : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Grayscale Toggle + Intensity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <label className="text-main font-sans text-sm font-semibold uppercase sm:text-base md:text-base">
                Grayscale
              </label>
              <button
                onClick={() => toggleSetting("grayscale")}
                className={`relative h-6 w-12 rounded-full p-0.5 transition-colors sm:h-7 sm:w-14 md:h-8 md:w-16 ${
                  localSettings.grayscale.enabled
                    ? "bg-[#79c99e]"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out sm:h-6 sm:w-6 md:h-7 md:w-7 md:rounded-2xl ${
                    localSettings.grayscale.enabled
                      ? "translate-x-6 sm:translate-x-7 md:translate-x-8"
                      : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={localSettings.grayscale.value}
              onChange={(e) => updateSlider("grayscale", e.target.value)}
              className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none sm:h-3 md:h-3"
              disabled={!localSettings.grayscale.enabled}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 sm:text-sm">0%</span>
              <span className="text-sm font-medium text-gray-700 sm:text-base">
                {localSettings.grayscale.value}%
              </span>
              <span className="text-xs text-gray-500 sm:text-sm">100%</span>
            </div>
          </div>

          {/* Blur & Brightness Toggles */}
          {["blur", "brightness"].map((key) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <label className="text-main font-sans text-sm font-semibold uppercase sm:text-base md:text-base">
                  {key}
                </label>
                <button
                  onClick={() => toggleSetting(key)}
                  className={`relative h-6 w-12 rounded-full p-0.5 transition-colors sm:h-7 sm:w-14 md:h-8 md:w-16 ${
                    localSettings[key].enabled ? "bg-[#79c99e]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out sm:h-6 sm:w-6 md:h-7 md:w-7 ${
                      localSettings[key].enabled
                        ? "translate-x-6 sm:translate-x-7 md:translate-x-8"
                        : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
              <input
                type="range"
                min="0"
                max={key === "brightness" ? "200" : "10"}
                value={localSettings[key].value}
                onChange={(e) => updateSlider(key, e.target.value)}
                className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none sm:h-3 md:h-3"
                disabled={!localSettings[key].enabled}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 sm:text-sm">0%</span>
                <span className="text-sm font-medium text-gray-700 sm:text-base">
                  {
                    key === "blur"
                      ? Math.round(localSettings[key].value * 10) // Convert blur to percentage
                      : Math.min(100, Math.round(localSettings[key].value / 2)) // Cap brightness at 100%
                  }
                  %
                </span>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {key === "brightness" ? "100%" : "100%"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;
