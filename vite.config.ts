import path from 'node:path';
import { defineConfig, type PluginOption, ProxyOptions } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import dotenv from 'dotenv';
import packageJson from './package.json';
import zipPack from 'vite-plugin-zip-pack';

dotenv.config();

const productionMode = process.env.NODE_ENV === 'production';
/** Backend development mode */
const goDev = process.env.GO_MODE === 'development';
const zipMode = process.env.ZIP_MODE === '1';

const plugins: PluginOption[] = [
  vue(),
  Components({
    dts: true,
    resolvers: [
      AntDesignVueResolver({
        importStyle: false, // css in js
      }),
    ],
    types: [
      {
        from: 'vue-router',
        names: ['RouterLink', 'RouterView'],
      },
    ],
  }),
];

if (zipMode) {
  plugins.push(
    zipPack({
      inDir: 'dist',
      outDir: 'release',
      outFileName: `${packageJson.name}_v${packageJson.version}.zip`,
    })
  );
}

let proxy: Record<string, string | ProxyOptions> | undefined;
if (!productionMode) {
  const devServer = process.env.DEV_SERVER || 'http://localhost:8080';
  const proServer = process.env.PRO_SERVER;

  const serverHttp = goDev ? devServer : proServer || devServer;
  proxy = {
    '/api': serverHttp,
  };

  if (!goDev) {
    console.info('WARN: Use the backend of the production mode!');
  }
}

const now = new Date();

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1024,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins,
  define: {
    'import.meta.env.GO_DEV': goDev,
    'import.meta.env.VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.DATE': JSON.stringify(
      `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.toLocaleTimeString()}+0800`
    ),
  },
  server: {
    proxy,
  },
});
