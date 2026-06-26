import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      "colors": {
          "surface-bright": "#2c3a4c",
          "error": "#ffb4ab",
          "primary-fixed-dim": "#adc6ff",
          "error-container": "#93000a",
          "surface-variant": "#273647",
          "on-primary-fixed": "#001a42",
          "on-surface-variant": "#c2c6d6",
          "surface-container-lowest": "#010f1f",
          "outline-variant": "#424754",
          "surface": "#051424",
          "on-tertiary-fixed": "#131b2e",
          "on-error": "#690005",
          "inverse-on-surface": "#233143",
          "on-secondary-fixed": "#111c2d",
          "tertiary-fixed-dim": "#bec6e0",
          "on-surface": "#d4e4fa",
          "on-primary-fixed-variant": "#004395",
          "on-tertiary-fixed-variant": "#3f465c",
          "inverse-surface": "#d4e4fa",
          "surface-container-highest": "#273647",
          "on-tertiary": "#283044",
          "primary-fixed": "#d8e2ff",
          "secondary-container": "#3e495d",
          "on-secondary": "#263143",
          "on-error-container": "#ffdad6",
          "surface-container-high": "#1c2b3c",
          "primary-container": "#4d8eff",
          "primary": "#adc6ff",
          "surface-dim": "#051424",
          "on-primary-container": "#00285d",
          "background": "#051424",
          "tertiary": "#bec6e0",
          "on-secondary-fixed-variant": "#3c475a",
          "surface-container-low": "#0d1c2d",
          "secondary-fixed-dim": "#bcc7de",
          "surface-tint": "#adc6ff",
          "tertiary-fixed": "#dae2fd",
          "secondary": "#bcc7de",
          "outline": "#8c909f",
          "on-background": "#d4e4fa",
          "on-primary": "#002e6a",
          "surface-container": "#122131",
          "inverse-primary": "#005ac2",
          "tertiary-container": "#8990a8",
          "on-secondary-container": "#aeb9d0",
          "on-tertiary-container": "#22293d",
          "secondary-fixed": "#d8e3fb"
      },
      "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
      },
      "spacing": {
          "base": "4px",
          "gutter": "24px",
          "max-content-width": "1200px",
          "margin-desktop": "32px",
          "margin-mobile": "16px"
      },
      "fontFamily": {
          "headline-lg": ["Inter", "sans-serif"],
          "body-md": ["Inter", "sans-serif"],
          "headline-xl": ["Inter", "sans-serif"],
          "headline-md": ["Inter", "sans-serif"],
          "label-md": ["JetBrains Mono", "monospace"],
          "body-lg": ["Inter", "sans-serif"],
          "headline-lg-mobile": ["Inter", "sans-serif"],
          "label-sm": ["JetBrains Mono", "monospace"]
      },
      "fontSize": {
          "headline-lg": ["30px", { "lineHeight": "38px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
          "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
          "headline-xl": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
          "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
          "label-md": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
          "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
          "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
          "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }]
      }
    },
  },
  plugins: [],
};
export default config;
