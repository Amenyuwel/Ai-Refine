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
      <section className="flex w-[80%] flex-row items-center justify-between">
        {/* Text Content and Button */}
        <div className="flex w-[50%] flex-col items-start justify-center">
          <h1 className="text-main text-[60px] leading-tight font-bold">
            Quickly augment your images automatically
          </h1>
          <p className="text-main mt-4 text-2xl opacity-90">{description}</p>

          {/* Button wrapped with Link */}
          <Link href="/feature/info">
            <button className="mt-6 flex cursor-pointer gap-2 place-self-start rounded-full bg-[#79C99E] px-8 py-3 transition-transform hover:scale-105">
              <span className="flex flex-row items-center text-2xl text-white">
                Learn More
                <FaArrowCircleRight className="ml-2 text-2xl" />
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
          className="h-[40%] w-[40%] cursor-pointer object-contain transition-transform duration-300 ease-out hover:scale-105"
          alt="Mutant"
        />
      </section>
    </main>
  );
};

export default AboutPage;
