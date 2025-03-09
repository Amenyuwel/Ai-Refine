import React from "react";
import { FaAngleDoubleUp } from "react-icons/fa";

const ContactPage = ({ scrollToHome }) => {
  return (
    <main className="h-screen w-full bg-third relative">
      <button
        className="w-12 h-12 bg-main flex items-center justify-center absolute bottom-4 right-5 rounded-full text-white text-2xl shadow-lg cursor-pointer"
        onClick={scrollToHome}
      >
        <FaAngleDoubleUp className="text-[#008CFF]" />
      </button>
    </main>
  );
};

export default ContactPage;
