/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './dev/index.html', // página de desenvolvimento/teste
    './dev/*.html', // página de desenvolvimento/teste
    "./dev/**/*.{ts,tsx,js,jsx,html}",
    "./src/**/*.{ts,tsx,js,jsx,html}",
  ],
  // SAFE LIST para classes que são usadas via JSON
  safelist: [
    'text-slate-400',
    'text-emerald-500',
    'font-bold',
    'text-red-500',
    'text-blue-500',
    'text-amber-500', // Adicionei esta, caso a use no futuro
    'text-sky-500',   // Adicionei esta, caso a use no futuro
    'text-slate-300',

    // Cores de preenchimento para as linhas (SVG)
    'fill-slate-50',
    'fill-white',

    // Classes importantes para o tooltip (HTML)
    'bg-slate-800',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}