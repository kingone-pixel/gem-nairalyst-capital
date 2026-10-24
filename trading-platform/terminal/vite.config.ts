import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Trading Terminal',
        short_name: 'Terminal',
        theme_color: '#0b0e11',
        background_color: '#0b0e11',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
      // Good practice to disable PWA caching in dev so it doesn't slow you down
      devOptions: {
        enabled: false,
      },
    }),
  ],
  // 👇 THIS IS THE MISSING PIECE 👇
  server: {
    host: '0.0.0.0', // Forces Codespaces to see the port
    port: 5173,
    strictPort: true,
  },
});