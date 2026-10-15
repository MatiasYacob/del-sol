// #==========# IMPORTACIONES #==========#
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// #==========# CONFIGURACIÓN DE VITE #==========#
export default defineConfig({
  // Habilita la integración de React durante desarrollo y compilación.
  plugins: [react()],

  // Conserva el puerto previsto para evitar cambiar la URL sin advertencia.
  server: {
    port: 5173,
    strictPort: true,
  },
});
