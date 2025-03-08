import React from "react";

const HomePage = () => {
  return (
    <div className="h-screen w-full bg-main flex items-center justify-center">
      {/* Image & Text Section */}
      <div className="flex flex-col items-center relative">
        {/* Pixel Image */}
        <img
          src="/images/pixel.png"
          alt="Pixel Image"
          className="h-full w-full object-contain"
        />

        {/* Two-Line Text */}
        <h1 className="text-main text-left text-6xl font-bold text-gray-800 mt-4 leading-tight">
          AUGMENT YOUR <br /> IMAGES
        </h1>
      </div>

      <div className="h-full w-[40%] bg-main flex items-center flex-col justify-center">
        <div className="flex flex-col w-[80%] h-[60%] rounded-[50px] bg-white shadow-md items-center justify-center">
          <button className="text-sans rounded-full h-[10%] w-[40%] bg-[#008CFF] text-white text-2xl">
            UPLOAD IMAGE
          </button>
          <p className="text-main pt-2">OR DRAG YOUR IMAGE</p>
        </div>
        <p className="text-main text-2xl place-self-center mt-4">
          Quickly generate dataset variations
        </p>
        <div className="justify-between h-[9%] w-[80%] bg-main flex flex-row mt-4">
          <p className="text-main mt-2 text-xl">
            No Image? <br />
            Try one of these:
          </p>
          <div className="h-full w-26 bg-white rounded-[12] shadow-md">
            <img
              src="/images/Animal.png"
              className="h-full w-full object-contain"
            ></img>
          </div>
          <div className="h-full w-26 bg-white rounded-[12] shadow-md">
            <img
              src="/images/Object.png"
              className="h-full w-full object-contain"
            ></img>
          </div>
          <div className="h-full w-26 bg-white rounded-[12] shadow-md">
            <img
              src="/images/Pest.png"
              className="h-full w-full object-contain"
            ></img>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
