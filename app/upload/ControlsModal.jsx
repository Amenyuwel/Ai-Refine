"use client";
import React from "react";
import { FaTimes } from "react-icons/fa";

const ControlsModal = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  const modalContent = {
    controls: {
      title: "Controls Settings",
      content: "Adjust the control settings here.",
    },
    randomize: {
      title: "Randomization Settings",
      content: "Customize randomization preferences here.",
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-[90%] sm:w-[50%] md:w-[30%] relative">
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
      </div>
    </div>
  );
};

export default ControlsModal;
