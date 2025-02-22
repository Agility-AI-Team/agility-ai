import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: '#e3edf7',
        background: '#050910',
        primary: '#99bce1',
        secondary: '#38257e',
        accent: '#7144c8',
      },
      keyframes: {
        pulseExpand: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.2)' },
        },
      },
      animation: {
        pulseExpand: 'pulseExpand 4.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /bg-(secondary|primary|accent)\/[0-9]+/,
    }
  ]
} satisfies Config;
