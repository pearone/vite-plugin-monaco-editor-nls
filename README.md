# Vite Plugin monaco-editor-nls

Install:

```shell
yarn add -D vite-plugin-monaco-editor-nls
```

Add this plugin in vite.config.ts：

```typescript
import monacoEditorNlsPlugin, {Languages} from 'vite-plugin-monaco-editor-nls';

plugins: [monacoEditorNlsPlugin({locale: 'zh-hans' as Languages})];
```
