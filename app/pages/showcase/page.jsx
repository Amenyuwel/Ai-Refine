"use client";

import React, { useState } from "react";

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
    <section className="bg-third flex h-screen w-full flex-col items-center justify-center px-6 py-12">
      {/* Title */}
      <h2 className="mb-8 text-center text-5xl font-bold">
        SEE IT FOR YOURSELF!
      </h2>

      {/* Categories */}
      <nav className="flex justify-center space-x-6 py-4 text-lg font-semibold">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`cursor-pointer rounded-lg px-6 py-3 transition-all ${
              selectedCategory === category
                ? "bg-transparent text-[var(--secondary)]"
                : "text-main bg-transparent"
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Image Augmentation Showcase */}
      <div className="mt-8 flex w-full flex-col items-center">
        <ImageShowcase category={selectedCategory} />
      </div>
    </section>
  );
};

const ImageShowcase = ({ category }) => {
  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-6">
      {/* Original Image */}
      <figure className="rounded-lg bg-white p-4 shadow-lg">
        <img
          src={imagePaths[category].Original}
          alt="Original"
          draggable="false"
          onDragStart={preventImageActions}
          onContextMenu={preventImageActions}
          className="h-64 w-52 object-contain"
        />
        <figcaption className="mt-2 text-center text-lg font-semibold">
          ORIGINAL
        </figcaption>
      </figure>

      {/* Augmented Images */}
      {augmentations.slice(1).map((aug) => (
        <figure key={aug} className="rounded-lg bg-white p-4 shadow-lg">
          <img
            src={imagePaths[category][aug]}
            alt={aug}
            draggable="false"
            onDragStart={preventImageActions}
            onContextMenu={preventImageActions}
            className="h-64 w-52 object-contain"
          />
          <figcaption className="mt-2 text-center text-lg font-semibold">
            {aug.toUpperCase()}
          </figcaption>
        </figure>
      ))}
    </div> 
  );
};

export default ShowCase;
