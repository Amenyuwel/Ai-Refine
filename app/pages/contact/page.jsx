import React from "react";
import Footer from "@/components/Footer";
import { FaAngleDoubleUp } from "react-icons/fa";

const ContactPage = ({ scrollToHome }) => {
  return (
    <main className="min-h-screen w-full bg-main flex flex-col items-center justify-center relative font-sans">
      {/* Contact Form Section */}
      <section className="h-[80%] w-[40%] flex flex-col justify-center items-center text-center flex-grow space-y-6 p-8">
        {/* Intro Text */}
        <div className="w-full flex flex-col items-center text-center">
          <h1 className="text-main text-6xl font-bold mb-6">Contact</h1>
          <p className="text-main text-lg font-semibold">
            Have a question? Leave your details and <br /> I’ll get back to you as soon as possible.
          </p>
        </div>

        {/* Name Field */}
        <div className="w-[60%] text-left">
          <label className="block text-main text-lg font-semibold mb-2">Name</label>
          <input
            type="text"
            placeholder="e.g. Amenyuwel"
            className="w-full py-3 px-4 shadow-md bg-main rounded-md focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>

        {/* Email Field */}
        <div className="w-[60%] text-left">
          <label className="block text-main text-lg font-semibold mb-2">Email</label>
          <input
            type="email"
            placeholder="e.g. Amenyuwel@gmail.com"
            className="w-full py-3 px-4 bg-main shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>

        {/* Message Field */}
        <div className="w-[60%] text-left">
          <label className="block text-main text-lg font-semibold mb-2">Message</label>
          <textarea
            placeholder="e.g. Hey! I'd like to know more about your services."
            rows="4"
            className="w-full py-3 px-4 bg-main shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-[#008CFF] resize-none"
          ></textarea>
        </div>

        {/* Submit Button (Aligned Right) */}
        <div className="w-[60%] flex justify-end">
          <button className="text-lg px-6 py-2 bg-transparent text-[#3D3D3D] rounded-md cursor-pointer relative overflow-hidden font-sans group font-semibold">
            <span className="absolute inset-0 bg-main transform scale-y-0 origin-bottom transition-transform duration-150 ease-out group-hover:scale-y-100"></span>
            <span className="relative z-10 transition-colors duration-50 group-hover:text-[#008CFF]">
              SUBMIT
            </span>
          </button>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        className="group-hover:scale-y-100 hover:bg-[#008CFF] origin-bottom transition-colors duration-300 z-50 w-12 h-12 bg-[#3D3D3D] flex items-center justify-center rounded-full text-white text-2xl shadow-lg cursor-pointer hover-animate-updown absolute ease-out bottom-[6rem] left-1/2 transform -translate-x-1/2"
        onClick={scrollToHome}
      >
        <FaAngleDoubleUp />
      </button>

      <Footer />
    </main>
  );
};

export default ContactPage;
