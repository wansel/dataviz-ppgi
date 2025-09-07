/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './dev/index.html', // página de desenvolvimento/teste
    "./dev/**/*.{ts,tsx,js,jsx,html}",
    "./src/**/*.{ts,tsx,js,jsx,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}