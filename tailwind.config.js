/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'celeste-cyan': '#B2FFFF', // Signature pale sky-blue cyan
        'celeste-purple-dark': '#3E2731', // Dark background purple
        'celeste-purple-mid': '#553D68', // Mid-tone purple
        'celeste-purple-light': '#664A7B', // Lighter purple
        'celeste-pink-dark': '#45283C', // Dark clothing/element pinkish
        'celeste-pink-mid': '#3F3F74', // Mid-tone pinkish/purple
        'celeste-pink-light': '#AC3232', // Madeline's hair red/pink
        'celeste-skin-light': '#D9A066', // Lighter skin tone
        'celeste-skin-dark': '#EEC39A', // Darker skin tone
        'celeste-highlight': '#D0C4D2', // High contrast highlight
      },
      fontFamily: {
        // Assuming Renogare or similar geometric sans-serif is not directly available.
        // Using Montserrat as a close alternative or a generic sans-serif.
        // If Renogare can be imported as a font, that would be ideal.
        'celeste': ['Montserrat', 'sans-serif'],
        // If you have a specific font file, you'd import it and add it here.
        // Example: 'Renogare', sans-serif
      },
    },
  },
  plugins: [],
}
