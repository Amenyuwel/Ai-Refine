"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useParallax = (elements) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      elements.forEach(({ ref, options }) => {
        if (ref.current) {
          gsap.fromTo(
            ref.current,
            {
              y: options.startY || 100,
              opacity: 0,
            },
            {
              y: options.endY || 0,
              opacity: 1,
              // Slower duration for a smoother feel
              duration: options.duration || 3,
              // Gentler ease-out compared to power2.out or expo.out
              ease: "power1.out",
              immediateRender: false,
              scrollTrigger: {
                trigger: ref.current,
                start: options.start || "top 80%", // begin
                end: options.end || "top 50%", // finish
                scrub: options.scrub || 2, // Ties to scroll movement
              },
            },
          );
        }
      });
    }
  }, [elements]);

  return null;
};

export default useParallax;
