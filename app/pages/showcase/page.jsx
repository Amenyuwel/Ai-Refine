"use client";

import React, { useState } from "react";

const categories = ["People", "Object", "Pests", "Animals", "Plant"];
const augmentations = ["Original", "Flipped", "Blurred", "Grayscale", "Rotated"];

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
    <section className="h-screen w-full bg-second flex flex-col items-center justify-center px-6 py-12">
      {/* Title */}
      <h2 className="text-center text-5xl font-bold mb-8">SEE IT FOR YOURSELF!</h2>

      {/* Categories */}
      <nav className="flex justify-center space-x-6 text-lg font-semibold py-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-lg transition-all cursor-pointer ${
              selectedCategory === category ? "bg-transparent text-white" : "bg-transparent text-main"
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Image Augmentation Showcase */}
      <div className="flex flex-col items-center w-full mt-8">
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
    <div className="flex flex-wrap justify-center items-center w-full gap-6">
      {/* Original Image */}
      <figure className="bg-white rounded-lg shadow-lg p-4">
        <img
          src={imagePaths[category].Original}
          alt="Original"
          draggable="false"
          onDragStart={preventImageActions}
          onContextMenu={preventImageActions}
          className="w-52 h-64 object-contain"
        />
        <figcaption className="text-center font-semibold text-lg mt-2">ORIGINAL</figcaption>
      </figure>

      {/* Augmented Images */}
      {augmentations.slice(1).map((aug) => (
        <figure key={aug} className="bg-white rounded-lg shadow-lg p-4">
          <img
            src={imagePaths[category][aug]}
            alt={aug}
            draggable="false"
            onDragStart={preventImageActions}
            onContextMenu={preventImageActions}
            className="w-52 h-64 object-contain"
          />
          <figcaption className="text-center font-semibold text-lg mt-2">{aug.toUpperCase()}</figcaption>
        </figure>
      ))}
    </div>
  );
};

export default ShowCase;
