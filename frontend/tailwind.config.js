/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      width: {
        'chart' : '800px',
        'chart-lg' : '1000px',
        'chart-xl' : '1300px',
        'pie' : '500px'
      },
      height: {
        'chart' : '600px'
      }
    },
  },
  plugins: [],
}

