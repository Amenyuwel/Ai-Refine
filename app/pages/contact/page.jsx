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

    handleSubmit(e); // Call the original handleSubmit function
  };

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center font-sans">
      <HeroPattern />
      <ToastContainer />
      <section className="flex h-[80%] w-[40%] flex-col items-center justify-center space-y-6 p-8 text-center">
        <div className="flex w-full flex-col items-center">
          <h1 className="text-main mb-6 text-6xl font-bold">
            Write me something!
          </h1>
          <p className="text-main text-lg font-semibold">
            Have a question? Leave your details and <br /> I’ll get back to you
            as soon as possible.
          </p>
        </div>

        <form
          onSubmit={validateAndSubmit}
          className="flex w-[60%] flex-col space-y-4 text-left"
        >
          <div>
            <label
              htmlFor="name"
              className="text-main mb-2 block text-lg font-semibold"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Amenyuwel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-main w-full rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
              aria-label="Name"
              aria-describedby="nameHelp"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-main mb-2 block text-lg font-semibold"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. Amenyuwel@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-main w-full rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
              aria-label="Email"
              aria-describedby="emailHelp"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="text-main mb-2 block text-lg font-semibold"
            >
              Message
            </label>
            <textarea
              id="message"
              placeholder="e.g. Hey! I'd like to know more about your services."
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-main w-full resize-none rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
              aria-label="Message"
              aria-describedby="messageHelp"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="text-main group relative cursor-pointer overflow-hidden rounded-md bg-transparent px-6 py-2 text-lg font-semibold"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 transform bg-[#79C99E] transition-transform duration-150 ease-out group-hover:scale-y-100"></span>
              <span className="relative z-10 transition-colors duration-50 group-hover:text-white">
                SUBMIT
              </span>
            </button>
          </div>
        </form>
      </section>

      <button
        type="button"
        title="Scroll to Top"
        className="hover-animate-updown absolute bottom-0 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-[#3D3D3D] text-2xl text-white shadow-lg transition-colors duration-300 ease-out hover:bg-[#79C99E]"
        onClick={scrollToHome}
        aria-label="Scroll to Top"
      >
        <FaAngleDoubleUp />
      </button>
    </main>
  );
};

export default ContactPage;
