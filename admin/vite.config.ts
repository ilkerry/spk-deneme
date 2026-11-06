import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Supabase ayarları uygulamayla ortak: kök klasördeki .env dosyasından okunur
// (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
export default defineConfig({
  plugins: [react()],
  envDir: '..',
  envPrefix: ['EXPO_PUBLIC_'],
  server: { port: 5199 },
});
