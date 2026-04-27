/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#07111f",
        panel: "#0d1a2b",
        accent: "#59f0c2",
        highlight: "#6ea8ff"
      },
      boxShadow: {
        glow: "0 30px 80px rgba(47, 108, 255, 0.18)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(89,240,194,0.18), transparent 25%), radial-gradient(circle at top right, rgba(110,168,255,0.18), transparent 22%), linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))"
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
