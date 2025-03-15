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
    <main className="fixed inset-0 flex items-center justify-center z-50 flex-col">
      <FaTimes
        title="Close"
        className="flex text-white cursor-pointer ml-[31%]"
        onClick={onClose}
      />
      <section className="bg-main p-6 rounded-lg shadow-2xl h-[60%] ml-[45%] w-[30%]">
        <h2 className="text-xl text-main font-bold">
          {modalContent[type]?.title}
        </h2>
        <p className="mt-2">{modalContent[type]?.content}</p>
      </section>
    </main>
  );
};

export default ControlsModal;
