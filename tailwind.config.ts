import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Quicksand", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Teal: primary / comfort (dark-theme values from the CompanionOS prototype)
        brand: {
          50: "#28403D", // tint bg for chips/icons/active-nav
          500: "#4FBFB3", // solid teal: buttons, logo, focus rings
          600: "#3FA89C", // hover/pressed solid, default link color
          700: "#BDECE6", // light teal: text on tinted chips, hover-brighten on links
          900: "#153832", // deep teal: gradient end
        },
        // Amber: secondary / warmth
        amber: {
          50: "#3E3222",
          500: "#F0AE55",
          700: "#F6C98A", // light amber: text on tinted chips
        },
        // Coral: alerts, non-alarmist — also doubles as the "Red" resident-record category
        coral: {
          50: "#422D27",
          500: "#EE8A72",
          600: "#EE8A72", // text on tinted chips
          700: "#F3A892", // text on tinted chips (slightly lighter variant)
        },
        // "Green" resident-record category (Care): distinct from the teal brand accent
        green: {
          50: "#1E3A26",
          500: "#5FBD74",
          700: "#B8E8C4",
        },
        // "Pink" resident-record category (Medical, non-medication)
        pink: {
          50: "#3D2530",
          500: "#E8829E",
          700: "#F6C3D2",
        },
        // "Orange" resident-record category (Belongings & Documents)
        orange: {
          50: "#3D2817",
          500: "#F2914A",
          700: "#F9C79A",
        },
        // Warm dark neutrals: page canvas + card/sidebar surface
        cream: {
          50: "#211D19", // canvas (page background)
          100: "#332D27", // surface (cards, sidebar, fields)
        },
        // Text on the dark canvas/surfaces
        ink: {
          600: "#B9ADA0", // muted/secondary text
          700: "#F3EEE6", // primary text
          800: "#F3EEE6", // primary text
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 3px 0 rgb(0 0 0 / 0.35)",
        soft: "0 6px 20px -8px rgb(0 0 0 / 0.5)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
