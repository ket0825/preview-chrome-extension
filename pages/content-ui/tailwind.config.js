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
  // theme: {
  //   extend: {
  //     colors: {
  //       gray: {
  //         300: '#e2e8f0',
  //         800: '#2d3748',
  //         card: '#68717A',
  //       },
  //       blue: {
  //         500: '#4299e1',
  //       },
  //       red: {
  //         500: '#f56565',
  //       },
  //       green: {
  //         500: '#48bb78',
  //       },
  //       black: '#000000',
  //     },
  //   },
  // },
};
