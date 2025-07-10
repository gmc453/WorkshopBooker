import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  define: {
    // ✅ POPRAWKA: Ustawiam prawidłowy adres API Gateway - port 5000 zgodnie z docker-compose.yml
    'process.env.NEXT_PUBLIC_API_GATEWAY_URL': JSON.stringify('http://localhost:5000')
  }
})