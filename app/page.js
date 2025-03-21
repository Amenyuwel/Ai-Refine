"use client";
import React, { useRef } from "react";
import Navbar from "@/components/Navbar"; // Absolute import using @
import ControlPage from "@/feature/upload/page"; // Fix absolute import
import HomePage from "@/pages/home/page";
import AboutPage from "@/pages/about/page";
import ShowCase from "@/pages/showcase/page";
import ContactPage from "@/pages/contact/page"; // Fix contact import

const Page = () => {
  // Create refs for each section
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Function to scroll smoothly to the section
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="overflow-hidden overflow-y-auto h-screen w-full">
      {/* Navbar receives refs to enable scrolling */}
      <Navbar
        scrollToSection={scrollToSection}
        homeRef={homeRef}
        aboutRef={aboutRef}
        contactRef={contactRef}
      />

      {/* Assign refs to sections */}
      <div ref={homeRef}>
        <HomePage />
      </div>
      <div ref={aboutRef}>
        <AboutPage />
      </div>
      <ShowCase />
      <div ref={contactRef}>
        <ContactPage scrollToHome={() => scrollToSection(homeRef)} />
      </div>
    </div>
  );
};

export default Page;