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
      <ToastContainer
        pauseOnHover={false}
        draggable={false}
        position="bottom-center"
      />
      <section className="flex h-auto w-full flex-col items-center justify-center space-y-6 p-6 text-center sm:h-[80%] sm:w-[40%] sm:p-8">
        <div className="flex w-full flex-col items-center">
          <p className="text-main text-xl font-semibold sm:text-2xl">
            Drop me a message with your details, and I’ll get back to you as
            soon as I can!
          </p>
        </div>

        <form
          onSubmit={validateAndSubmit}
          className="flex w-full flex-col space-y-4 text-left sm:w-[60%]"
        >
          <div>
            <label
              htmlFor="name"
              className="text-main mb-2 block text-base font-semibold sm:text-lg"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Amenyuwel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-main w-full rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              aria-label="Name"
              aria-describedby="nameHelp"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-main mb-2 block text-base font-semibold sm:text-lg"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. Amenyuwel@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-main w-full rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              aria-label="Email"
              aria-describedby="emailHelp"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="text-main mb-2 block text-base font-semibold sm:text-lg"
            >
              Message
            </label>
            <textarea
              id="message"
              placeholder="e.g. Hey! I'd like to know more about your services."
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-main w-full resize-none rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              aria-label="Message"
              aria-describedby="messageHelp"
            ></textarea>
          </div>

          <div className="flex justify-center sm:justify-end">
            <button
              type="submit"
              className="text-main group relative cursor-pointer overflow-hidden rounded-md bg-transparent px-6 py-2 text-base font-semibold sm:text-lg"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 transform bg-[#79C99E] transition-transform duration-150 ease-out group-hover:scale-y-100"></span>
              <span className="relative z-10 transition-colors duration-50 group-hover:text-white">
                SEND
              </span>
            </button>
          </div>
        </form>
      </section>

      <button
        type="button"
        title="Scroll to Top"
        className="hover-animate-updown absolute bottom-0 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 translate-y-1/2 transform cursor-pointer items-center justify-center rounded-lg bg-[#3D3D3D] text-2xl text-white shadow-lg transition-colors duration-300 ease-out hover:bg-[var(--primary)]"
        onClick={scrollToHome}
        aria-label="Scroll to Top"
      >
        <FaAngleDoubleUp />
      </button>
    </main>
  );
};

export default ContactPage;
