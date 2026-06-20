// ----------------------------------------------------------
// GharDisha AI — Vite build configuration
// Wires the React plugin so `npm run dev` compiles JSX.
// Dev server on port 5173 (matches backend CORS settings).
// ----------------------------------------------------------
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
