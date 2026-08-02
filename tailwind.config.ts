import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1A18",
        gold: "#C6A045",
        goldDeep: "#A5822E",
        ivory: "#F7F5F0",
        card: "#FFFFFF",
        line: "#E7E1D4",
        muted: "#7A756C",
        green: "#3F8F4E",
        greenBg: "#E7F4E9",
        orange: "#D98A2B",
        orangeBg: "#FBEBD6",
        red: "#B5442E",
        redBg: "#F7E3DE",
        grey: "#A6A198",
        greyBg: "#EFEDE7",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
