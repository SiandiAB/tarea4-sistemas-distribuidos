import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Rutas relativas: permite publicar el build en cualquier hosting
  // estatico (GitHub Pages, Netlify, Vercel...) sin ajustar la raiz.
  base: './',
  server: {
    port: 5050
  }
})
