# Vite Plugin monaco-editor-nls

### Install:

```shell
yarn add -D vite-plugin-monaco-editor-nls
```

### Using

Add this plugin in vite.config.ts：

```typescript
import MonacoEditorNlsPlugin, {
    esbuildPluginMonacoEditorNls,
    Languages,
} from 'vite-plugin-monaco-editor-nls';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': resolve('./src'),
        },
    },
    build: {
        sourcemap: true,
    },
    optimizeDeps: {
        /** vite >= 2.3.0 */
        esbuildOptions: {
            plugins: [
                esbuildPluginMonacoEditorNls({
                    locale: Languages.zh_hans,
                }),
            ],
        },
    },
    plugins: [
        reactRefresh(),
        MonacoEditorNlsPlugin({locale: Languages.zh_hans}),
    ],
});
```

### Using custom locale

> It dependency on [vscode-loc](https://github.com/microsoft/vscode-loc) to get the locales.

- First

`npm install git+ssh://git@github.com:microsoft/vscode-loc.git`

- Then

```typescript
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
                    /**
                     * The weight of `localedata` is higher than that of `locale`
                     */
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
            /**
             * The weight of `localedata` is higher than that of `locale`
             */
            localeData: zh_CN.contents
        }),
    ],
});

```

### Question

1. Incomplete localization

> try using custom locale , please
