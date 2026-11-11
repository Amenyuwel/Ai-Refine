"use client";
import React from "react";
import Image from "next/image";

const MutantImage = () => {
  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <Image
      src="/images/Mutant.png"
      width={535}
      height={403}
      sizes="(min-width: 640px) 40vw, 50vw"
      draggable="false"
      onDragStart={preventImageActions}
      onContextMenu={preventImageActions}
      className="h-[50%] w-[50%] cursor-pointer object-contain transition-transform duration-300 ease-out hover:scale-105 sm:h-[40%] sm:w-[40%]"
      alt="Illustration of an image augmented into several variations"
    />
  );
};

export default MutantImage;
