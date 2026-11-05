import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  build: { outDir:'dist', emptyOutDir: true, rollupOptions:{input:{main:resolve(import.meta.dirname,'index.html'),admin:resolve(import.meta.dirname,'admin.html')}} },
});
