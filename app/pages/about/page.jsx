import React from "react";
import description from "./descAbout";
import { FaArrowCircleRight } from "react-icons/fa";
import Link from "next/link"; // Import Link for navigation

const AboutPage = () => {
  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <main className="bg-main flex h-[100vh] w-full items-center justify-center px-6">
      <section className="flex flex-col sm:flex-row w-full sm:w-[80%] items-center justify-center gap-y-8 sm:gap-x-8">
        {/* Text Content and Button */}
        <div className="flex w-full sm:w-[50%] flex-col items-center sm:items-start justify-center text-center sm:text-left">
          <h1 className="text-main text-3xl sm:text-5xl leading-tight font-bold break-words">
            Quickly augment your images automatically
          </h1>
          <p className="text-main mt-4 text-lg sm:text-xl opacity-90">{description}</p>

          {/* Button wrapped with Link */}
          <Link href="/feature/info">
            <button className="mt-6 flex cursor-pointer gap-2 place-self-center sm:place-self-start rounded-full bg-[var(--primary)] px-6 sm:px-8 py-3 transition-transform hover:scale-105 hover:brightness-105">
              <span className="flex flex-row items-center text-base sm:text-lg text-white">
                Learn augmentation
                <FaArrowCircleRight className="ml-2 text-xl sm:text-2xl" />
              </span>
            </button>
          </Link>
        </div>

        {/* Image */}
        <img
          src="/images/Mutant.png"
          draggable="false"
          onDragStart={preventImageActions}
          onContextMenu={preventImageActions}
          className="h-[50%] w-[50%] sm:h-[40%] sm:w-[40%] cursor-pointer object-contain transition-transform duration-300 ease-out hover:scale-105"
          alt="Mutant"
        />
      </section>
    </main>
  );
};

export default AboutPage;
