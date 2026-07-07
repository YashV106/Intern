import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,tsx,jsx,mdx}",
    "./src/components/**/*.{js,ts,tsx,jsx,mdx}",
    "./src/app/**/*.{js,ts,tsx,jsx,mdx}",
    "./src/**/*.{js,ts,tsx,jsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
