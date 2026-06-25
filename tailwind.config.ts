import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: "#F4F1FA",
          100: "#E6E1F2",
          300: "#B8A9D9",
          600: "#6B5A94",
          800: "#473A66",
        },
        teal: {
          50: "#F0F9F7",
          100: "#D9EDE9",
          300: "#8FC9BE",
          600: "#3E7A6E",
        },
        peach: {
          50: "#FEF4EE",
          100: "#FCE3D6",
          300: "#F2AE85",
          600: "#C2693F",
        },
        sage: {
          100: "#E8F0E0",
          300: "#B7CFA0",
          600: "#5F7A4A",
        },
        plum: {
          100: "#EFEAF7",
          500: "#8B7BA8",
          700: "#5B4A7A",
        },
        cream: {
          50: "#FBF8F3",
          100: "#F5F0E8",
        },
        ink: {
          300: "#C7C1B5",
          600: "#7A7468",
          900: "#3A3530",
        },
        error: {
          DEFAULT: "#C2554F",
          bg: "#FBEAE8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm: "12px",
        md: "20px",
        lg: "28px",
        xl: "36px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(91, 74, 122, 0.08)",
        raised: "0 8px 24px rgba(91, 74, 122, 0.12)",
        modal: "0 16px 40px rgba(91, 74, 122, 0.16)",
      },
      fontSize: {
        "display-xl": ["40px", { lineHeight: "1.15", fontWeight: "700" }],
        "display-lg": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["24px", { lineHeight: "1.25", fontWeight: "600" }],
        "display-sm": ["19px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};

export default config;
