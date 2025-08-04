"use client";
import React, { useRef } from "react";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import HomePage from "@/pages/home/page";
import AboutPage from "@/pages/about/page";
import ShowCase from "@/pages/showcase/page";
import ContactPage from "@/pages/contact/page";
import useParallax from "@/hooks/useParallax";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page = () => {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const showcaseRef = useRef(null);
  const contactRef = useRef(null);

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

  return (
    <div className="h-full w-full">
      <ToastContainer />
      <Navbar
        scrollToSection={(ref) =>
          ref?.current?.scrollIntoView({ behavior: "smooth" })
        }
        homeRef={homeRef}
        aboutRef={aboutRef}
        contactRef={contactRef}
      />
      <div className="overflow-y-hidden">
        <section ref={homeRef} className="flex min-h-screen items-center">
          <HomePage />
        </section>
        <section ref={aboutRef} className="flex items-center">
          <AboutPage />
        </section>
        <section ref={showcaseRef} className="flex min-h-screen items-center">
          <ShowCase />
        </section>
        <section ref={contactRef} className="flex items-center pb-16">
          <ContactPage
            scrollToHome={() =>
              homeRef.current.scrollIntoView({ behavior: "smooth" })
            }
          />
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default Page;
