import reactRefresh from '@vitejs/plugin-react-refresh';
import {resolve} from 'path';
import {defineConfig} from 'vite';

import monacoEditorNlsPlugin, {Languages} from '../src/index';
const prefix = `monaco-editor/esm/vs`;

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': resolve('./src'),
        },
    },
    optimizeDeps: {
        include: [
            `${prefix}/language/typescript/ts.worker`,
            `${prefix}/editor/editor.worker`,
        ],
    },
    plugins: [
        monacoEditorNlsPlugin({locale: 'zh-hans' as Languages}) as Plugin,
        reactRefresh(),
    ],
});
