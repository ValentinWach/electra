/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      width: {
        'chart-screen-sm' : '100%',
        'chart-screen-2xl' : '66.666667%',
        'pie' : '500px'
      },
      maxWidth: {
        'chart' : '1200px',
        'chart-xl' : '1500px',
        'pie' : '500px'
      },
      height: {
        'chart' : '600px'
      },
      fontFamily: {
        sans: ['inter', 'sans-serif'],
        heading: ['inter', 'sans-serif'],
      },
    },
  },

  plugins: [],
}

