import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Alma Artesã — em desenvolvimento, o Vite encaminha "/api" para o PHP.
// Cenário padrão: só o MySQL roda no XAMPP; a API PHP roda com o servidor
// embutido do próprio PHP (php -S), apontando para o MySQL do XAMPP.
// Pode sobrescrever sem editar o arquivo, com uma variável de ambiente:
//   VITE_API_PROXY_TARGET=http://localhost/alma-artesa/backend npm run dev
// (troque para esse formato só se também for servir o PHP pelo Apache do XAMPP)
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
