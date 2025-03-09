import React from "react";
import description from "./descAbout";

const AboutPage = () => {
  const preventImageActions = (event) => {
    event.preventDefault();
  };
  return (
    <main className="h-screen w-full bg-main flex items-center justify-center">
      <section className="flex flex-row items-center gap-x-[250px] w-[80%]">
        <article className="flex flex-col items-center w-[50%]">
          <h1 className="text-main text-8xl text-left">
            Quickly augment your images automatically
          </h1>
          <p className="text-2xl text-main text-left mt-4">{description}</p>
        </article>
        <img
          src="/images/Mutant.png"
          draggable="false" // Prevent dragging
          onDragStart={preventImageActions} // Prevent dragging events
          onContextMenu={preventImageActions} // Disable right-click on image
          className="cursor-pointer transition-transform duration-300 ease-out hover:scale-105 h-[30%] w-[30%] object-contain"
          alt="Mutant"
        ></img>
      </section>
    </main>
  );
};

export default AboutPage;
