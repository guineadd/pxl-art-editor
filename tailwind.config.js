/** @type {import('tailwindcss').Config} */
export default {
  content: ["./public/**/*.{html, js}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        header: {
          normal: "#817274",
          hover: "#635456"
        },
        primary: {
          normal: "#E6CBCE",
          hover: "#cfabaf"
        },
        secondary: {
          normal: "#853c51",
          hover: "#6b2b3d"
        },
        canvasDef: {
          normal: "#B68B97",
          hover: "#946572"
        }
      },
      fontFamily: {
        monolt: ['"JetBrains Mono Light"', "monospace"],
        monomd: ['"JetBrains Mono Medium"', "monospace"]
      }
    },
    screens: {
      xl: { max: "1280px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1024px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "768px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "640px" },
      // => @media (max-width: 639px) { ... }

      xs: { max: "530px" }
      // => @media (max-width: 529px) { ... }
    }
  },
  plugins: []
};
