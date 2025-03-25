"use client"; // if you're in app directory
import React, { useState } from "react";
import pb from "@/utils/pocketbase"; // adjust import to your path
import { FaAngleDoubleUp } from "react-icons/fa";

const ContactPage = ({ scrollToHome }) => {
  // 1. Local state to store form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // 2. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 3. Create a new record in the "contactMessages" collection
      await pb.collection("contact_messages").create({
        name,
        email,
        message,
      });

      // 4. Reset or show success feedback
      setName("");
      setEmail("");
      setMessage("");
      alert("Message submitted successfully!");
    } catch (error) {
      console.error("Error submitting message:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="bg-main relative flex h-[80vh] w-full flex-col items-center justify-center font-sans">
      <section className="flex h-[80%] w-[40%] flex-grow flex-col items-center justify-center space-y-6 p-8 text-center">
        <div className="flex w-full flex-col items-center text-center">
          <h1 className="text-main mb-6 text-6xl font-bold">Contact</h1>
          <p className="text-main text-lg font-semibold">
            Have a question? Leave your details and <br /> I’ll get back to you
            as soon as possible.
          </p>
        </div>

        {/* 5. Wire up inputs to state */}
        <div className="w-[60%] text-left">
          <label className="text-main mb-2 block text-lg font-semibold">
            Name
          </label>
          <input
            type="text"
            placeholder="e.g. Amenyuwel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-main w-full rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
          />
        </div>

        <div className="w-[60%] text-left">
          <label className="text-main mb-2 block text-lg font-semibold">
            Email
          </label>
          <input
            type="email"
            placeholder="e.g. Amenyuwel@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-main w-full rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
          />
        </div>

        <div className="w-[60%] text-left">
          <label className="text-main mb-2 block text-lg font-semibold">
            Message
          </label>
          <textarea
            placeholder="e.g. Hey! I'd like to know more about your services."
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-main w-full resize-none rounded-md px-4 py-3 shadow-md focus:ring-2 focus:ring-[#008CFF] focus:outline-none"
          ></textarea>
        </div>

        {/* 6. Attach submit handler */}
        <div className="flex w-[60%] justify-end">
          <button
            onClick={handleSubmit}
            className="text-main group relative cursor-pointer overflow-hidden rounded-md bg-transparent px-6 py-2 text-lg font-semibold"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 transform bg-[#79C99E] transition-transform duration-150 ease-out group-hover:scale-y-100"></span>
            <span className="relative z-10 transition-colors duration-50 group-hover:text-white">
              SUBMIT
            </span>
          </button>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        title="Scroll to Top"
        className="hover-animate-updown absolute bottom-0 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-[#3D3D3D] text-2xl text-white shadow-lg transition-colors duration-300 ease-out hover:bg-[#79C99E]"
        onClick={scrollToHome}
      >
        <FaAngleDoubleUp />
      </button>
    </main>
  );
};

export default ContactPage;
