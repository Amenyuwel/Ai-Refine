"use client";

import React, { useState } from "react";
import Image from "next/image";

const categories = ["People", "Object", "Pests", "Animals", "Plant"];
const augmentations = [
  "Original",
  "Flipped",
  "Blurred",
  "Grayscale",
  "Rotated",
];

const imagePaths = {
  People: {
    Original: "/images/People/PeopleOriginal.png",
    Flipped: "/images/People/People_flipped.png",
    Blurred: "/images/People/People_blurred.png",
    Grayscale: "/images/People/People_grayscale.png",
    Rotated: "/images/People/People_rotated.png",
  },
  Pests: {
    Original: "/images/Pest/PestOriginal.png",
    Flipped: "/images/Pest/Pest_flipped.png",
    Blurred: "/images/Pest/Pest_blurred.png",
    Grayscale: "/images/Pest/Pest_grayscale.png",
    Rotated: "/images/Pest/Pest_rotated.png",
  },
  Object: {
    Original: "/images/Object/ObjectOriginal.png",
    Flipped: "/images/Object/Object_flipped.png",
    Blurred: "/images/Object/Object_blurred.png",
    Grayscale: "/images/Object/Object_grayscale.png",
    Rotated: "/images/Object/Object_rotated.png",
  },
  Animals: {
    Original: "/images/Animals/AnimalOriginal.png",
    Flipped: "/images/Animals/Animal_flipped.png",
    Blurred: "/images/Animals/Animal_blurred.png",
    Grayscale: "/images/Animals/Animal_grayscale.png",
    Rotated: "/images/Animals/Animal_rotated.png",
  },
  Plant: {
    Original: "/images/Plant/PlantOriginal.png",
    Flipped: "/images/Plant/Plant_flipped.png",
    Blurred: "/images/Plant/Plant_blurred.png",
    Grayscale: "/images/Plant/Plant_grayscale.png",
    Rotated: "/images/Plant/Plant_rotated.png",
  },
};

const ShowCase = () => {
  const [selectedCategory, setSelectedCategory] = useState("People");

  return (
    <section className="bg-third flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 sm:h-screen">
      {/* Title */}
      <h2 className="mb-8 text-center text-5xl font-bold">
        SEE IT FOR YOURSELF!
      </h2>

      {/* Categories */}
      <div role="group" aria-label="Showcase categories" className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6 py-4 text-lg font-semibold px-4 sm:px-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-shrink-0 cursor-pointer rounded-full px-6 py-3 transition-all ${
              selectedCategory === category
                ? "bg-[var(--secondary)] text-white"
                : "text-main bg-transparent"
            }`}
            aria-pressed={selectedCategory === category}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Image Augmentation Showcase */}
      <div className="mt-8 flex w-full flex-col items-center">
        <ImageShowcase category={selectedCategory} />
      </div>
    </section>
  );
};

const ImageShowcase = React.memo(function ImageShowcase({ category }) {
  const preventImageActions = (event) => event.preventDefault();

  if (!imagePaths[category]) {
    return (
      <div className="text-center text-red-500">
        <p>Invalid category: {category}</p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`${category} image augmentations`}
      tabIndex={0}
      className="flex w-full overflow-x-auto sm:overflow-visible flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-4 sm:gap-6 px-4 sm:px-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)]"
    >
      {augmentations.map((aug) => (
        <figure
          key={aug}
          className="flex-shrink-0 w-[80%] sm:w-auto rounded-lg bg-white p-4 shadow-lg"
        >
          <Image
            src={imagePaths[category][aug]}
            alt={`${category} - ${aug}`}
            width={540}
            height={612}
            sizes="(min-width: 640px) 208px, 80vw"
            draggable="false"
            onDragStart={preventImageActions}
            onContextMenu={preventImageActions}
            className="h-48 w-full sm:h-64 sm:w-52 cursor-pointer object-contain transition-transform duration-300 ease-in-out hover:scale-105"
          />
          <figcaption className="mt-2 text-center text-sm sm:text-lg font-semibold">
            {aug.toUpperCase()}
          </figcaption>
        </figure>
      ))}
    </div>
  );
});

export default ShowCase;
