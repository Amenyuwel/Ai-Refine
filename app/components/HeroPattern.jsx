"use client"; 
// This directive ensures the component is rendered on the client side, which is necessary for browser-specific APIs like `canvas`.

import { useEffect, useRef } from "react"; 
// `useEffect` is used for side effects (e.g., setting up event listeners), and `useRef` is used to reference the canvas DOM element.

export default function HeroPattern({ dotSize = 2, dotColor = "#E5E7EB" }) { 
// The component accepts `dotSize` and `dotColor` as props with default values for flexibility.

  const canvasRef = useRef(null); 
  // A ref is created to directly access the canvas DOM element.

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d"); 
    // Access the 2D rendering context of the canvas.

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawPattern(); 
      // Resize the canvas to match the window size and redraw the pattern.
    };

    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      // Clear the canvas before drawing to avoid overlapping patterns.

      for (let x = 0; x < canvas.width; x += 25) { 
        // Loop through the canvas width with a spacing of 25 pixels.
        for (let y = 0; y < canvas.height; y += 25) { 
          // Loop through the canvas height with the same spacing.
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2); 
          // Draw a circle (dot) at the current position with the specified size.
          ctx.fillStyle = dotColor; 
          // Set the fill color for the dot.
          ctx.fill(); 
          // Fill the dot with the specified color.
        }
      }
    };

    window.addEventListener("resize", resizeCanvas); 
    // Add an event listener to handle window resizing and redraw the pattern.

    resizeCanvas(); 
    // Initial call to set the canvas size and draw the pattern.

    return () => window.removeEventListener("resize", resizeCanvas); 
    // Cleanup: Remove the resize event listener when the component unmounts.
  }, [dotSize, dotColor]); 
  // Dependencies: Re-run the effect if `dotSize` or `dotColor` changes.

  return (
    <canvas
      id="hero-pattern"
      style={{ position: "fixed", pointerEvents: "none" }} 
      // The canvas is fixed in position and does not interfere with user interactions.
      ref={canvasRef} 
      // Attach the ref to the canvas element.
      className="fixed top-0 left-0 -z-10 h-full w-full" 
      // Tailwind CSS classes for positioning and layering.
    />
  );
}
