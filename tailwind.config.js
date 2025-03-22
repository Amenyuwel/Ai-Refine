export default {
  darkMode: "class", // Enables dark mode manually using class
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        textMain: "var(--text-main)",
        ctaMain: "var(--cta-main)",
        ctaHover: "var(--cta-hover)",
        secondaryGradientStart: "var(--secondary-gradient-start)",
        secondaryGradientEnd: "var(--secondary-gradient-end)",
        bgMain: "var(--bg-main)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        heading: ["Oswald", "sans-serif"],
      },
      backgroundImage: {
        main: "var(--bg-main)",
        second:
          "linear-gradient(100deg, var(--secondary-gradient-start) 0%, var(--secondary-gradient-end) 100%)",
        third: "url('/background/Wave.png')",
      },
      animation: {
        updown: "updown 1.5s ease-in-out infinite",
        downup: "downup 1.5s ease-in-out infinite",
      },
      keyframes: {
        updown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        downup: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(20px)" },
        },
      },
    },
  },
  plugins: [],
};
