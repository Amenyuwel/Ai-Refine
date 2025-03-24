"use client";
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

  const modalContent = {
    controls: {
      title: "Controls Settings",
      content: "Adjust the control settings here.",
    },
  };

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Toggle Flip (Left ↔ Right)
  const toggleFlip = () => {
    const updatedSettings = {
      ...localSettings,
      flip: {
        enabled: !localSettings.flip.enabled,
        value: localSettings.flip.value === 1 ? -1 : 1,
      },
    };
    setLocalSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  // Toggle settings (Grayscale, Blur, Brightness)
  const toggleSetting = (key) => {
    const updatedSettings = {
      ...localSettings,
      [key]: { ...localSettings[key], enabled: !localSettings[key].enabled },
    };
    setLocalSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  // Update slider value (Grayscale, Blur, Brightness)
  const updateSlider = (key, value) => {
    const updatedSettings = {
      ...localSettings,
      [key]: { ...localSettings[key], value },
    };
    setLocalSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-45 flex items-center justify-center bg-transparent">
      <div className="pointer-events-auto relative ml-[50%] h-[55%] w-[30%] rounded-lg bg-white p-6 shadow-2xl">
        <button
          title="Close"
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {modalContent[type]?.title}
        </h2>
        <p className="mt-2 text-gray-600">{modalContent[type]?.content}</p>

        <div className="mt-4 space-y-6">
          {/* Flip Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-main text-bold uppercase">Flip</label>
            <button
              onClick={toggleFlip}
              className={`h-5 w-10 rounded-full ${
                localSettings.flip.enabled ? "bg-green-400" : "bg-gray-300"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-all ${
                  localSettings.flip.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Grayscale Toggle + Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium uppercase">Grayscale</label>
              <button
                onClick={() => toggleSetting("grayscale")}
                className={`h-5 w-10 rounded-full ${
                  localSettings.grayscale.enabled
                    ? "bg-green-400"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-all ${
                    localSettings.grayscale.enabled
                      ? "translate-x-5"
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
              className="w-full cursor-pointer"
              disabled={!localSettings.grayscale.enabled}
            />
          </div>

          {/* Blur & Brightness Toggles */}
          {["blur", "brightness"].map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-medium uppercase">{key}</label>
                <button
                  onClick={() => toggleSetting(key)}
                  className={`h-5 w-10 rounded-full ${
                    localSettings[key].enabled ? "bg-green-400" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white transition-all ${
                      localSettings[key].enabled
                        ? "translate-x-5"
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
                className="w-full cursor-pointer"
                disabled={!localSettings[key].enabled}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;
