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
    <div className="h-screen w-full bg-second pt-[5%] items-center justify-center flex-col">
      {/* Title */}
      <h2 className="text-center text-5xl font-bold mt-2">
        SEE IT FOR YOURSELF!
      </h2>

      {/* Categories */}
      <div className="flex justify-center space-x-8 text-lg font-semibold mt-15 cursor-pointer">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              selectedCategory === category
                ? "bg-transparent text-white"
                : "bg-transparent text-main"
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Image Augmentation Showcase */}
      <div className="flex flex-col items-center mt-25">
        <ImageShowcase category={selectedCategory} />
      </div>
    </div>
  );
};

const ImageShowcase = ({ category }) => {
  return (
    <div className="flex flex-wrap justify-center items-center w-full gap-8">
      {/* Original Image */}
      <div className="p-4 bg-white rounded-lg shadow-lg">
        <img
          src={imagePaths[category].Original}
          alt="Original"
          className="w-54 h-70 object-contain"
        />
        <p className="text-center font-semibold mt-2 text-lg">ORIGINAL</p>
      </div>

      {/* Augmented Images */}
      {augmentations.slice(1).map((aug) => (
        <div key={aug} className="p-4 bg-white rounded-lg shadow-lg">
          <img
            src={imagePaths[category][aug]}
            alt={aug}
            className="w-56 h-70 object-contain"
          />
          <p className="text-center font-semibold mt-2 text-lg">
            {aug.toUpperCase()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ShowCase;
