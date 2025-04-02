"use client";
import React, { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

// The scrollToSection function (to be used with the Navbar)
const scrollToSection = (sectionRef, offset = 0) => {
  if (sectionRef && sectionRef.current) {
    // Calculate the position of the section relative to the document
    const sectionPosition =
      sectionRef.current.getBoundingClientRect().top + window.scrollY;
    // Scroll to the position with an offset to avoid overlap with the navbar
    window.scrollTo({
      top: sectionPosition - offset, // Subtract the navbar height
      behavior: "smooth", // Smooth scrolling
    });
  }
};

const Navbar = ({ homeRef, aboutRef, contactRef }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = useCallback(
    (sectionRef, route) => {
      const navbarHeight = 80; // Set your navbar height here (in px)

      if (pathname === "/") {
        // If already on the home page and scrollToSection exists, scroll with an offset
        if (scrollToSection) {
          scrollToSection(sectionRef, navbarHeight); // Pass the navbar height as the offset
        }
      } else {
        // Navigate to home first, then scroll after the page loads
        router.push(route);
        setTimeout(() => {
          if (scrollToSection) {
            scrollToSection(sectionRef, navbarHeight); // Add offset after navigation
          }
        }, 100); // Add a small delay to ensure navigation happens first
      }
    },
    [pathname, router],
  );

  return (
    <header className="bg-main sticky top-0 z-[50] flex w-full items-center justify-between px-6 py-3 shadow-md">
      {/* NAVIGATION LINKS */}
      <h1
        className="cursor-pointer px-8 text-4xl font-bold"
        onClick={() => handleNavigation(homeRef, "/")}
      >
        ai-refine
      </h1>

      <nav className="flex gap-6">
        <button
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={() => handleNavigation(homeRef, "/")}
        >
          HOME
        </button>
        <button
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={() => handleNavigation(aboutRef, "/")}
        >
          ABOUT
        </button>
        <button
          className="cursor-pointer rounded-lg px-4 py-2 font-sans text-xl transition"
          onClick={() => handleNavigation(contactRef, "/")}
        >
          CONTACT
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
