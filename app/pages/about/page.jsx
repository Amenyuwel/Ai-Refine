import React from "react";
import description from "./descAbout";
import { FaArrowCircleRight } from "react-icons/fa";

const AboutPage = () => {
  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <main className="bg-main flex h-[80vh] w-full items-center justify-center px-6">
      <section className="flex w-[80%] flex-row items-center justify-between">
        {/* Text Content and Button */}
        <div className="flex w-[50%] flex-col items-center justify-center">
          <h1 className="text-main text-[60px] leading-tight font-bold">
            Quickly augment your images automatically
          </h1>
          <p className="text-main mt-4 text-2xl opacity-90">{description}</p>

          {/* Button */}
          <button className="mt-6 flex w-[30%] items-center justify-center gap-2 place-self-start rounded-lg bg-[#79C99E] px-6 py-3 text-lg font-semibold text-white transition-transform hover:scale-105">
            Learn More
            <FaArrowCircleRight className="text-2xl" />
          </button>
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
