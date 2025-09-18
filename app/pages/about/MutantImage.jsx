"use client";
import React from "react";

const MutantImage = () => {
  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <img
      src="/images/Mutant.png"
      draggable="false"
      onDragStart={preventImageActions}
      onContextMenu={preventImageActions}
      className="h-[50%] w-[50%] cursor-pointer object-contain transition-transform duration-300 ease-out hover:scale-105 sm:h-[40%] sm:w-[40%]"
      alt="Mutant"
    />
  );
};

export default MutantImage;
