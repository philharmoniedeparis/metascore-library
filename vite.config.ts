import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import vueDevTools from 'vite-plugin-vue-devtools'
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { type UserConfig } from 'vite'

type ENTRY = 'metaScore.Player' | 'metaScore.API' | 'metaScore.Editor'

const __dirname = dirname(fileURLToPath(import.meta.url));
const entries:Record<ENTRY, string> = {
  'metaScore.Player': resolve(__dirname, './src/player/index.js'),
  'metaScore.API': resolve(__dirname, './src/player/modules/api/entry.js'),
  'metaScore.Editor': resolve(__dirname, './src/editor/index.js'),
};
const entry = process.env.BUILD_ENTRY as ENTRY|undefined ?? 'metaScore.Editor'
const umd = process.env.BUILD_MODE === "umd" && entry

const config:UserConfig = {
  plugins: [
    vue(),
    svgLoader(),
    vueI18nPlugin({
      strictMessage: false,
      compositionOnly: false,
    }),
    vueDevTools(),
  ],
  define: {
    PACKAGE_VERSION: JSON.stringify(process.env.npm_package_version),
    'process.env': process.env,
    __VUE_I18N_FULL_INSTALL__: false,
    __VUE_I18N_LEGACY_API__: true,
  },
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
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@core": fileURLToPath(new URL("./src/core", import.meta.url)),
      "@editor": fileURLToPath(new URL("./src/editor", import.meta.url)),
      "@player": fileURLToPath(new URL("./src/player", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    copyPublicDir: false,
    cssCodeSplit: !umd,
    sourcemap: true,
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
          return umd && assetInfo.names.at(0) === 'metascore-library.css' ?
            `${entry}.css` :
            `[name]-[hash][extname]`;
        },
        chunkFileNames: umd ? `chunks/${entry}-umd-[name]-[hash].js` : `chunks/[name]-[hash].js`,
      }
    },
  },
}

export default config
