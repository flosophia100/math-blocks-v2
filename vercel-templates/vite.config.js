import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: '/',                    // Vercel本番URLのベースパス
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,           // 本番では軽量化のためfalse
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true           // ビルド前のクリア
  },
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'             // Vercel環境対応
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'             // Preview環境対応
  },
  resolve: {
    alias: {
      '@': './js'               // プロジェクトに応じて調整
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});