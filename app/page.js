"use client";
import React, { useRef, useEffect } from "react";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import HomePage from "@/pages/home/page";
import AboutPage from "@/pages/about/page";
import ShowCase from "@/pages/showcase/page";
import ContactPage from "@/pages/contact/page";
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
          targetRef.current.scrollIntoView({ behavior: 'smooth' });
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
        scrollToSection={(ref) =>
          ref?.current?.scrollIntoView({ behavior: "smooth" })
        }
        homeRef={homeRef}
        aboutRef={aboutRef}
        contactRef={contactRef}
      />
      <div className="overflow-y-hidden">
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
