// chrome-extension\vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import makeManifestPlugin from './utils/plugins/make-manifest-plugin';
import { watchRebuildPlugin } from '@chrome-extension-boilerplate/hmr';

const rootDir = resolve(__dirname);
const libDir = resolve(rootDir, 'lib');

const isDev = process.env.__DEV__ === 'true';
const isProduction = !isDev;

const outDir = resolve(rootDir, '..', 'dist');
export default defineConfig({
  envPrefix: 'VITE_', // default
  // envDir: './', // default
  envDir: resolve(rootDir, '..'), // 프로젝트 루트 디렉토리로 설정
  resolve: {
    alias: {
      '@root': rootDir,
      '@lib': libDir,
      '@assets': resolve(libDir, 'assets'),
    },
  },
  plugins: [
    libAssetsPlugin({
      outputPath: outDir,
    }),
    makeManifestPlugin({ outDir }),
    isDev && watchRebuildPlugin({ reload: true }),
  ],
  publicDir: resolve(rootDir, 'public'),
  build: {
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, 'lib/background/index.ts'),
      name: 'BackgroundScript',
      fileName: 'background',
    },
    outDir,
    sourcemap: isDev,
    minify: isProduction,
    reportCompressedSize: isProduction,
    modulePreload: true,
    rollupOptions: {
      external: ['chrome'],
      output: {
        format: 'es',
      },
    },
  },
});
