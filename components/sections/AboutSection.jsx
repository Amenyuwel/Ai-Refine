"use client";
import React from "react";
import description from "./descAbout";
import { FaArrowCircleRight } from "react-icons/fa";
import Link from "next/link"; // Import Link for navigation
import MutantImage from "./MutantImage";

const AboutPage = () => {
  return (
    <div className="bg-main flex min-h-screen w-full items-center sm:h-[100vh] justify-center px-6">
      <section className="flex flex-col sm:flex-row w-full sm:w-[80%] items-center justify-center gap-y-8 sm:gap-x-8">
        {/* Text Content and Button */}
        <div className="flex w-full sm:w-[50%] flex-col items-center sm:items-start justify-center text-center sm:text-left">
          <h2 className="text-main text-3xl sm:text-5xl leading-tight font-bold break-words">
            Quickly augment your images automatically
          </h2>
          <p className="text-main mt-4 text-lg sm:text-xl opacity-90">{description}</p>

          {/* Button wrapped with Link */}
          <Link
            href="/feature/info"
            className="mt-6 flex cursor-pointer gap-2 place-self-center sm:place-self-start rounded-full bg-[var(--primary)] px-6 sm:px-8 py-3 transition-transform hover:scale-105 hover:brightness-105"
          >
              <span className="flex flex-row items-center text-base sm:text-lg text-main">
                Learn augmentation
                <FaArrowCircleRight className="ml-2 text-xl sm:text-2xl" />
              </span>
          </Link>
        </div>

        {/* Image */}
        <MutantImage />
      </section>
    </div>
  );
};

export default AboutPage;
