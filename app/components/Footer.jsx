"use client";
import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="relative flex h-[120px] w-full items-center justify-center space-x-6 bg-[#DCEEDF]">
      {/* GitHub Icon */}
      <a
        href="https://github.com/Amenyuwel"
        target="_blank"
        rel="noopener noreferrer"
        className="transform text-3xl text-[#3D3D3D] transition-all duration-300 hover:-translate-y-2 hover:text-[#79C99E]"
      >
        <FaGithub />
      </a>

      {/* LinkedIn Icon */}
      <a
        href="https://www.linkedin.com/in/amenyuwel/"
        target="_blank"
        rel="noopener noreferrer"
        className="transform text-3xl text-[#3D3D3D] transition-all duration-300 hover:-translate-y-2 hover:text-[#79C99E]"
      >
        <FaLinkedin />
      </a>
    </div>
  );
};

export default Footer;
