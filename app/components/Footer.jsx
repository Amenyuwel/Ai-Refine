import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-main h-[200px] w-full flex items-center justify-center space-x-6 relative">
      {/* GitHub Icon */}
      <a
        href="https://github.com/Amenyuwel"
        target="_blank"
        rel="noopener noreferrer"
        className="text-3xl text-[#3D3D3D] hover:text-[#008CFF] transition-all duration-300 transform hover:-translate-y-2"
      >
        <FaGithub />
      </a>

      {/* LinkedIn Icon */}
      <a
        href="https://www.linkedin.com/in/emmanuel-malagamba-01114228b/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-3xl text-[#3D3D3D] hover:text-[#008CFF] transition-all duration-300 transform hover:-translate-y-2"
      >
        <FaLinkedin />
      </a>
    </div>
  );
};

export default Footer;
