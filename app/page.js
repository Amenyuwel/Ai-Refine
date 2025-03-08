import React from "react";
import Navbar from "./components/Navbar";
import HomePage from "./home/homePage";
import AboutPage from "./about/aboutPage";
import ShowCase from "./showcase/ShowCase";
import ContactPage from "./contact/contactPage";

const page = () => {
  return (
    <div className="overflow:hidden overflow-y-auto h-screen w-full">
      <Navbar />
      <HomePage />
      <AboutPage />
      <ShowCase/>
      <ContactPage />
    </div>
  );
};

export default page;
