"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  COMPARISON_KEY_STEP_PERCENT,
  COMPARISON_START_PERCENT,
  clampPercent,
  percentFromPointer,
} from "@/utils/comparisonSlider";

const KEY_STEPS = {
  ArrowLeft: -COMPARISON_KEY_STEP_PERCENT,
  ArrowDown: -COMPARISON_KEY_STEP_PERCENT,
  ArrowRight: COMPARISON_KEY_STEP_PERCENT,
  ArrowUp: COMPARISON_KEY_STEP_PERCENT,
};

// Original image on the left of the divider, augmented image on the right
const ComparisonSlider = ({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  width,
  height,
  sizes,
  className = "",
}) => {
  const boxRef = useRef(null);
  const [position, setPosition] = useState(COMPARISON_START_PERCENT);

  const moveToPointer = (event) => {
    const { left, width: boxWidth } = boxRef.current.getBoundingClientRect();
    setPosition(percentFromPointer(event.clientX, left, boxWidth));
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    moveToPointer(event);
  };

  const handlePointerMove = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) moveToPointer(event);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Home") setPosition(0);
    else if (event.key === "End") setPosition(100);
    else if (event.key in KEY_STEPS) setPosition((current) => clampPercent(current + KEY_STEPS[event.key]));
    else return;
    event.preventDefault();
  };

  return (
    <div className={className}>
      {/* touch-action keeps horizontal touch drags on the slider instead of scrolling */}
      <div
        ref={boxRef}
        style={{ aspectRatio: `${width} / ${height}` }}
        className="relative w-full cursor-ew-resize touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onDragStart={(event) => event.preventDefault()}
        onContextMenu={(event) => event.preventDefault()}
      >
        <Image
          src={afterSrc}
          fill
          sizes={sizes}
          priority
          draggable="false"
          className="object-contain"
          alt={afterAlt}
        />
        <Image
          src={beforeSrc}
          fill
          sizes={sizes}
          priority
          draggable="false"
          className="object-contain"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          alt={beforeAlt}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-white"
          style={{ left: `${position}%` }}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare original and augmented image"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% original`}
          data-testid="comparison-handle"
          onKeyDown={handleKeyDown}
          className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[var(--primary)] text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] sm:h-14 sm:w-14"
          style={{ left: `${position}%` }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6 sm:h-8 sm:w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
