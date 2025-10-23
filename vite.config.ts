import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const projectId = env.VITE_CHU_PROJECT_ID || '';

  return {
    // 核心：设置 base 为 /projectId/，Vite 自动给 CSS 资源加前缀
    base: projectId ? `/${projectId}/` : '/', 
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './app'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});