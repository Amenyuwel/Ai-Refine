"use client";
import React, { useRef, useEffect } from "react";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import HomePage from "components/sections/HomeSection";
import AboutPage from "components/sections/AboutSection";
import ShowCase from "components/sections/ShowcaseSection";
import ContactPage from "components/sections/ContactSection";
import useParallax from "@/hooks/useParallax";

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

  // Handle hash navigation for deep linking from other pages
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the '#'
      let targetRef = null;
      
      switch (hash) {
        case 'home':
          targetRef = homeRef;
          break;
        case 'about':
          targetRef = aboutRef;
          break;
        case 'contact':
          targetRef = contactRef;
          break;
        default:
          break;
      }
      
      if (targetRef && targetRef.current) {
        setTimeout(() => {
          // offsetTop ignores the parallax translateY; scrollIntoView would land that offset too far down.
          // The sticky header sits in normal flow, so its real height is subtracted to clear it.
          const headerHeight = document.querySelector('header')?.offsetHeight ?? 0;
          const top = Math.max(0, targetRef.current.offsetTop - headerHeight);
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    };

    // Handle initial load with hash
    handleHashNavigation();
    
    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, [homeRef, aboutRef, contactRef]);

  return (
    <div className="h-full w-full">
      <Navbar
        homeRef={homeRef}
        aboutRef={aboutRef}
        contactRef={contactRef}
      />
      <main className="overflow-y-hidden">
        <section id="home" ref={homeRef} className="flex min-h-screen items-center">
          <HomePage />
        </section>
        <section id="about" ref={aboutRef} className="flex items-center">
          <AboutPage />
        </section>
        <section id="showcase" ref={showcaseRef} className="flex min-h-screen items-center">
          <ShowCase />
        </section>
        <section id="contact" ref={contactRef} className="flex items-center pb-16">
          <ContactPage
            scrollToHome={() => {
              // offsetTop ignores the parallax translateY, unlike scrollIntoView.
              const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
              window.scrollTo({
                top: Math.max(0, homeRef.current.offsetTop - headerHeight),
                behavior: "smooth",
              });
            }}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
