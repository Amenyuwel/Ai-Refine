"use client";
import React, { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ControlPage from "@/feature/upload/page";
import HomePage from "@/pages/home/page";
import AboutPage from "@/pages/about/page";
import ShowCase from "@/pages/showcase/page";
import ContactPage from "@/pages/contact/page";
import useParallax from "@/hooks/useParallax";

const Page = () => {
  // Create refs for each section
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const showcaseRef = useRef(null);
  const contactRef = useRef(null);

  // Apply parallax effect
  useParallax([
    {
      ref: homeRef,
      options: { startY: 150, endY: 0, duration: 0.6, scrub: 0.5 },
    },
    {
      ref: aboutRef,
      options: { startY: 110, endY: 0, duration: 0.6, scrub: 0.5 },
    },
    {
      ref: showcaseRef,
      options: { startY: 120, endY: 0, duration: 0.6, scrub: 0.5 },
    },
    {
      ref: contactRef,
      options: { startY: 80, endY: 0, duration: 0.6, scrub: 0.5 },
    },
  ]);

  // Scroll function
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-full w-full">
      <Navbar
        scrollToSection={scrollToSection}
        homeRef={homeRef}
        aboutRef={aboutRef}
        contactRef={contactRef}
      />

      {/* Removing h-screen from this container allows full content display */}
      <div className="overflow-y-hidden">
        <section ref={homeRef} className="flex min-h-screen items-center">
          <HomePage />
        </section>

        <section ref={aboutRef} className="flex min-h-screen items-center">
          <AboutPage />
        </section>

        <section ref={showcaseRef} className="flex min-h-screen items-center">
          <ShowCase />
        </section>

        <section ref={contactRef} className="flex items-center pb-16">
          <ContactPage scrollToHome={() => scrollToSection(homeRef)} />
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default Page;
