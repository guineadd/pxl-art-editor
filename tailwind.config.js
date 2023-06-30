/** @type {import('tailwindcss').Config} */
module.exports = {
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
    }
  },
  plugins: []
};
