import path from 'node:path';
import { defineConfig, type PluginOption, ProxyOptions } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import ZipPack from 'vite-plugin-zip-pack';
import dotenv from 'dotenv';
import packageJson from './package.json';

dotenv.config();

const productionMode = process.env.NODE_ENV === 'production';
/** Backend development mode */
const goDev = process.env.GO_MODE === 'development';
const zipMode = process.env.ZIP_MODE === '1';
const envDevServer = process.env.DEV_SERVER;
const envDevAdminPwd = process.env.DEV_ADMIN_PWD;
const envProServer = process.env.PRO_SERVER;
const envProAdminPwd = process.env.PRO_ADMIN_PWD;

const plugins: PluginOption[] = [
  Vue(),
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
    ZipPack({
      inDir: 'dist',
      outDir: 'release',
      outFileName: `${packageJson.name}_v${packageJson.version}.zip`,
    })
  );
}

let proxy: Record<string, string | ProxyOptions> | undefined;
if (!productionMode) {
  const devServer = envDevServer || 'http://localhost:8080';
  const proServer = envProServer;

  const serverHttp = goDev ? devServer : proServer || devServer;
  proxy = {
    '/api': serverHttp,
    '/assets': serverHttp,
    '/admin': serverHttp,
    '/favicon.ico': serverHttp,
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
    assetsDir: 'manager-assets',
    rollupOptions: {
      input: path.resolve(__dirname, 'manager.html'),
    },
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
      `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.toTimeString()}`
    ),
    'import.meta.env.DEV_ADMIN_PWD': JSON.stringify(envDevAdminPwd),
    'import.meta.env.PRO_ADMIN_PWD': JSON.stringify(envProAdminPwd),
  },
  server: {
    proxy,
    open: 'manager.html',
  },
});
