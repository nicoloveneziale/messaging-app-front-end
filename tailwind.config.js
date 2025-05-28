/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
   theme: {
    extend: {
      colors: {
        'dark-gray-bg': '#1a1a1a', 
        'medium-gray': '#2a2a2a',  
        'light-gray-text': '#e0e0e0', 
        'accent-blue': '#3B82F6', 
        'accent-green': '#10B981', 
      },
    },
  },
  plugins: [],
}
