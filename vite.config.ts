import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import injectChuPatch from './vite-plugin-inject-chu-patch'; // 引入 patch 插件

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const projectId = env.VITE_PROJECT_ID || '';

  return {
    base: `/${projectId}`,
    plugins: [
      react(),
      injectChuPatch(), // 注入插件
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
