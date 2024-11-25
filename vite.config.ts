import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { type UserConfig } from 'vite'

type ENTRY = 'metaScore.Player' | 'metaScore.API' | 'metaScore.Editor'

const __dirname = dirname(fileURLToPath(import.meta.url));
const entries:Record<ENTRY, string> = {
  'metaScore.Player': resolve(__dirname, './packages/player/index.js'),
  'metaScore.API': resolve(__dirname, './packages/player/modules/api/entry.js'),
  'metaScore.Editor': resolve(__dirname, './packages/editor/index.js'),
};
const entry = process.env.BUILD_ENTRY as ENTRY|undefined
const umd = process.env.BUILD_MODE === "umd" && entry

const config:UserConfig = {
  define: {
    PACKAGE_VERSION: JSON.stringify(process.env.npm_package_version),
    'process.env': process.env,
  },
  plugins: [
    Vue(),
    VueI18nPlugin({
      strictMessage: false,
    }),
    vueDevTools(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `
          @use "@core/scss/_mixins.scss";
        `,
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./packages", import.meta.url)),
      "@core": fileURLToPath(new URL("./packages/core", import.meta.url)),
      "@editor": fileURLToPath(new URL("./packages/editor", import.meta.url)),
      "@player": fileURLToPath(new URL("./packages/player", import.meta.url)),
    },
  },
  build: {
    minify: false,
    outDir: "dist",
    emptyOutDir: false,
    copyPublicDir: false,
    cssCodeSplit: !umd,
    lib: umd ? {
      name: 'metaScore',
      entry: entries[entry],
      fileName: (format: string) => `${entry}.${format}.js`,
      formats: ['umd'],
    } : {
      entry: entries,
      fileName: (format: string, entryName: string) => `${entryName}.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          return umd && assetInfo.name === 'style.css' ?
            `${entry}.css` :
            `[name]-[hash][extname]`;
        },
        chunkFileNames: umd ? `chunks/${entry}-umd-[name]-[hash].js` : `chunks/[name]-[hash].js`,
      }
    },
  },
}

export default config
