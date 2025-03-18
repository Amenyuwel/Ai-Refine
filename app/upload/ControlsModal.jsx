"use client";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const ControlsModal = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  const modalContent = {
    controls: {
      title: "Controls Settings",
      content: "Adjust the control settings here.",
    },
  };

  const [settings, setSettings] = useState({
    flip: { enabled: false, value: 0 },
    blur: { enabled: false, value: 0 },
    grayscale: { enabled: false, value: 0 },
    rotation: { enabled: false, value: 0 },
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const updateSlider = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-45 bg-transparent pointer-events-none">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-[30%] h-[47%] ml-[50%] relative pointer-events-auto">
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
          {/** Control Settings with Toggles and Sliders */}
          {Object.keys(settings).map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="uppercase font-medium">
                  {key}
                </label>
                <button
                  onClick={() => toggleSetting(key)}
                  className={`w-10 h-5 rounded-full ${
                    settings[key].enabled ? "bg-[#d3ebc6]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-all ${
                      settings[key].enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
              <input
                type="range"
                min="0"
                max={key === "rotation" ? "360" : "10"}
                value={settings[key].value}
                onChange={(e) => updateSlider(key, e.target.value)}
                className="w-full cursor-pointer"
                disabled={!settings[key].enabled}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;