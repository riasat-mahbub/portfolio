/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        scaleAnim: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        scale: 'scaleAnim 300ms ease-in-out',
      },

      colors: {
        'matrix-green': '#00FF41',
        'spotify-green': '#1DB954',
        'youtube-red': '#FF0000',
        'instagram-gradient-start': '#833AB4',
        'instagram-gradient-end': '#FD1D1D',
        'facebook-blue': '#1877F2',
        'twitter-blue': '#1DA1F2',
        'slack-purple': '#4A154B',
      }
    },
  },
  plugins: [],
};
