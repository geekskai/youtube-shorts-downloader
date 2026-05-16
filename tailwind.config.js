import forms from "@tailwindcss/forms"
import typography from "@tailwindcss/typography"

/** @type {import("tailwindcss/types").Config } */
const config = {
  trailingSlash: true,
  content: [
    "./node_modules/pliny/**/*.js",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
    "./layouts/**/*.{js,ts,tsx}",
    "./data/**/*.mdx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      lineHeight: {
        11: "2.75rem",
        12: "3rem",
        13: "3.25rem",
        14: "3.5rem",
      },
      colors: {
        primary: {
          50: "#eef8f6",
          100: "#d5efe9",
          200: "#abdfd4",
          300: "#7ec9b9",
          400: "#4fad9a",
          500: "#1a8f7a",
          600: "#116466", // Mars Green 马尔斯绿
          700: "#0d524f",
          800: "#093d3b",
          900: "#052928",
          // 50: '#E6FFFC', // Lightest cyan (95% luminosity)
          // 100: '#B3FFF5',
          // 200: '#80FFEE',
          // 300: '#4DFFE7',
          // 400: '#1AFFE0',
          // 500: '#00FFE0', // Base color
          // 600: '#00CCB3',
          // 700: '#009986',
          // 800: '#006659',
          // 900: '#00332C', // Deep teal
        },
        stone: {
          50: "#F5F5F5", // Ultra-light gray
          100: "#D9D9D9",
          200: "#B3B3B3",
          300: "#8C8C8C",
          400: "#666666",
          500: "#2A2A2A", // Base color
          600: "#222222",
          700: "#1A1A1A",
          800: "#121212",
          900: "#0A0A0A", // Near-black
        },
        coralred: {
          50: "#FFEEED", // Soft pink
          100: "#FFD5D3",
          200: "#FFABA8",
          300: "#FF817C",
          400: "#47f7c3",
          500: "#FF6B6B", // Base color
          600: "#D95353",
          700: "#B33A3A",
          800: "#8C2222",
          900: "#660A0A", // Deep burgundy
        },
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme("colors.primary.400"),
              "&:hover": {
                color: `${theme("colors.primary.600")}`,
              },
              code: { color: theme("colors.primary.400") },
            },
            "h1,h2": {
              fontWeight: "700",
              letterSpacing: theme("letterSpacing.tight"),
            },
            h3: {
              fontWeight: "600",
            },
            code: {
              color: theme("colors.indigo.500"),
            },
          },
        },
        invert: {
          css: {
            a: {
              color: theme("colors.primary.400"),
              "&:hover": {
                color: `${theme("colors.primary.600")}`,
              },
              code: { color: theme("colors.primary.400") },
            },
            "h1,h2,h3,h4,h5,h6": {
              color: theme("colors.stone.100"),
            },
          },
        },
      }),
    },
  },
  plugins: [forms, typography],
}

export default config
