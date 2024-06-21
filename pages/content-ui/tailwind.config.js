// tailwind.config.js
const baseConfig = require('@chrome-extension-boilerplate/tailwindcss-config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: ['src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  // 이미 존재함.
  theme: {
    extend: {
      text: {
        gray: {          
          card: {
            body: '#68717A'
          },
        },
      },
    },
    fontFamily: {
      Inter: ['Inter'],
    },
  },
};
