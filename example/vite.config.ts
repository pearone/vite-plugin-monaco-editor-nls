import reactRefresh from '@vitejs/plugin-react-refresh';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import MonacoEditorNlsPlugin, {
    esbuildPluginMonacoEditorNls,
    Languages,
} from 'vite-plugin-monaco-editor-nls';
import Inspect from 'vite-plugin-inspect';

const zh_CN = require('vscode-loc.git/i18n/vscode-language-pack-zh-hans/translations/main.i18n.json')

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    resolve: {
        alias: {
            '@': resolve('./src'),
        },
    },
    build: {
        sourcemap: true,
    },
    optimizeDeps: {
        /** vite 版本需要大于等于2.3.0 */
        esbuildOptions: {
            plugins: [
                esbuildPluginMonacoEditorNls({
                    locale: Languages.zh_hans,
                    localeData: zh_CN.contents
                }),
            ],
        },
    },
    plugins: [
        reactRefresh(),
        Inspect(),
        MonacoEditorNlsPlugin({
            locale: Languages.zh_hans,
            localeData: zh_CN.contents
        }),
    ],
});
