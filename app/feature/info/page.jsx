"use client";
import React, { useState } from "react";
import HeroPattern from "@/components/HeroPattern";
import Navbar from "@/components/Navbar";
import infoContent from "./infoContent";
import { FaArrowAltCircleRight, FaTimesCircle } from "react-icons/fa";

const Info = () => {
  const { question0, question1, question2, question3, question4, question5 } =
    infoContent;

  const questions = [
    question0,
    question1,
    question2,
    question3,
    question4,
    question5,
  ];

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleCardClick = (question) => {
    setSelectedQuestion(question);
  };

  const closeModal = () => {
    setSelectedQuestion(null);
  };

  return (
    <main className="scrollbar-thin scrollbar-thumb-[#008cff] scrollbar-track-gray-200 flex min-h-screen w-full flex-col items-center overflow-y-auto">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-10 w-full">
        <Navbar />
      </header>

      {/* Hero Section */}
      <HeroPattern />

      {/* Content Section with Grid Layout and Gridlines */}
      <div className="mt-16 flex h-[100px] w-full max-w-[45%] items-center gap-x-4 bg-transparent p-2">
        <h1 className="flex-1 text-lg font-bold text-[#2F2F2F] md:text-4xl">
          ENHANCE YOUR UNDERSTANDING OF IMAGE AUGMENTATION
        </h1>
      </div>

      <section className="grid h-screen w-[45%] grid-cols-1 gap-6 bg-transparent py-8 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((question, index) => (
          <article
            key={index}
            className="bg-main flex h-[80%] cursor-pointer flex-col items-center justify-start rounded-lg shadow-lg transition-transform hover:-translate-y-2 hover:shadow-xl"
            onClick={() => handleCardClick(question)}
          >
            {/* Render Image */}
            <img
              src={question.image}
              alt={question.heading}
              className="mb-4 h-32 w-full object-cover"
            />
            <h2 className="mb-2 px-4 text-left text-xl font-bold">
              {question.heading}
            </h2>
            <p className="px-4 text-sm text-gray-700">
              {question.description.length > 100
                ? question.description.slice(0, 80) + "..."
                : question.description}
            </p>
          </article>
        ))}
      </section>

      {/* Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#3d3d3d50]">
          <div className="bg-main relative w-[20%] rounded-lg shadow-lg">
            {/* Close Button */}
            <button
              className="bg-main absolute -top-4 -right-4 cursor-pointer rounded-full p-2 text-xl hover:bg-gray-300"
              onClick={closeModal}
            >
              <FaTimesCircle className="text-main opacity-80 transition-colors duration-200 hover:text-gray-600 hover:opacity-100" />
            </button>
            <img
              src={selectedQuestion.image}
              alt={selectedQuestion.heading}
              className="w-full object-cover"
            />
            <h2 className="px-4 py-2 text-left text-2xl font-bold">
              {selectedQuestion.heading}
            </h2>
            <p className="scrollbar-thin scrollbar-thumb-[#008cff] scrollbar-track-gray-200 mr-2 mb-4 max-h-40 overflow-y-auto px-4 py-4 text-left leading-relaxed text-gray-700">
              {selectedQuestion.description}
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Info;
