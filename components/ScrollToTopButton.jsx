"use client";
import React from "react";
import { FaAngleDoubleUp } from "react-icons/fa";

const ScrollToTopButton = ({ onClick }) => (
  <button
    type="button"
    title="Scroll to Top"
    className="hover-animate-updown absolute bottom-0 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 translate-y-1/2 transform cursor-pointer items-center justify-center rounded-lg bg-[#3D3D3D] text-2xl text-white shadow-lg transition-colors duration-300 ease-out hover:bg-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
    onClick={onClick}
    aria-label="Scroll to Top"
  >
    <FaAngleDoubleUp />
  </button>
);

export default ScrollToTopButton;
