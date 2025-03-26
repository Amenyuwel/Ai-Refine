"use client";
import { useEffect, useRef } from "react";

export default function HeroPattern({ dotSize = 2, dotColor = "#E5E7EB" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawPattern();
    };

    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let x = 0; x < canvas.width; x += 25) {
        // Adjusted spacing
        for (let y = 0; y < canvas.height; y += 25) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();
        }
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [dotSize, dotColor]);

  return (
    <canvas
      id="hero-pattern"
      style={{ position: "fixed", pointerEvents: "none" }}
      ref={canvasRef}
      className="fixed top-0 left-0 -z-10 h-full w-full"
    />
  );
}
