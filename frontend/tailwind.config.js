/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
      extend: {
          colors: {
              background: '#ffffff',
              foreground: '#000000',
              card: {
                  DEFAULT: '#f8f8f8',
                  foreground: '#333333'
              },
              popover: {
                  DEFAULT: '#e0e0e0',
                  foreground: '#4d4d4d'
              },
              primary: {
                  DEFAULT: '#d9d9d9',
                  foreground: '#262626'
              },
              secondary: {
                  DEFAULT: '#bfbfbf',
                  foreground: '#1a1a1a'
              },
              muted: {
                  DEFAULT: '#a6a6a6',
                  foreground: '#0d0d0d'
              },
              accent: {
                  DEFAULT: '#8c8c8c',
                  foreground: '#000000'
              },
              destructive: {
                  DEFAULT: '#737373',
                  foreground: '#000000'
              },
              border: '#595959',
              input: '#404040',
              ring: '#262626',
              chart: {
                  '1': '#1a1a1a',
                  '2': '#333333',
                  '3': '#4d4d4d',
                  '4': '#666666',
                  '5': '#808080'
              }
          },
          borderRadius: {
              lg: 'var(--radius)',
              md: 'calc(var(--radius) - 2px)',
              sm: 'calc(var(--radius) - 4px)'
          }
      }
  },
  plugins: [require("tailwindcss-animate")],
};