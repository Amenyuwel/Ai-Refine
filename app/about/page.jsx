import React from "react";
import description from "./descAbout";

const AboutPage = () => {
  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <main className="h-screen w-full bg-main flex items-center justify-center px-6">
      <section className="flex flex-row items-center justify-between w-[80%]">
        <article className="flex flex-col w-[50%]">
          <h1 className="text-main text-6xl leading-tight font-bold">
            Quickly augment your images automatically
          </h1>
          <p className="text-2xl text-main mt-4">{description}</p>
        </article>
        
        <img
          src="/images/Mutant.png"
          draggable="false"
          onDragStart={preventImageActions}
          onContextMenu={preventImageActions}
          className="cursor-pointer transition-transform duration-300 ease-out hover:scale-105 h-[40%] w-[40%] object-contain"
          alt="Mutant"
        />
      </section>
    </main>
  );
};

export default AboutPage;
