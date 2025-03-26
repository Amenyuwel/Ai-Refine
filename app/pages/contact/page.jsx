"use client";
import React from "react";
import { FaAngleDoubleUp } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useContactForm from "@/hooks/useContactForm";
import HeroPattern from "@/components/HeroPattern";

const ContactPage = ({ scrollToHome }) => {
  const { name, email, message, setName, setEmail, setMessage, handleSubmit } =
    useContactForm();

  const validateAndSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Fields must not be empty");
      return;
    }
    handleSubmit(e);
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center font-sans p-4">
      <HeroPattern />
      <ToastContainer />
      
      <section className="container flex flex-col items-center justify-center space-y-6 p-8 text-center">
        {/* Header */}
        <div className="w-full text-center">
          <h1 className="text-main mb-6 text-4xl md:text-6xl font-bold">Contact</h1>
          <p className="text-main text-lg font-semibold">
            Have a question? Leave your details and <br /> I’ll get back to you soon.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={validateAndSubmit}
          className="w-full max-w-md space-y-4 text-left"
        >
          <div>
            <label htmlFor="name" className="text-main mb-2 block text-lg font-semibold">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Amenyuwel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md px-4 py-3 bg-main shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-main mb-2 block text-lg font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. Amenyuwel@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md px-4 py-3 bg-main shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="message" className="text-main mb-2 block text-lg font-semibold">
              Message
            </label>
            <textarea
              id="message"
              placeholder="e.g. Hey! I'd like to know more about your services."
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-md px-4 py-3 bg-main shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="relative overflow-hidden rounded-md bg-[#79C99E] px-6 py-2 text-lg font-semibold text-white shadow-md hover:bg-[#008CFF] transition-all"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </section>

      {/* Scroll to Top Button */}
      <button
        type="button"
        title="Scroll to Top"
        className="fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3D3D3D] text-2xl text-white shadow-lg transition-colors duration-300 ease-out hover:bg-[#79C99E]"
        onClick={scrollToHome}
        aria-label="Scroll to Top"
      >
        <FaAngleDoubleUp />
      </button>
    </main>
  );
};

export default ContactPage;
