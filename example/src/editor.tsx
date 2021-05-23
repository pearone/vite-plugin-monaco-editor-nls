import React, {useEffect, useRef} from 'react';
import * as monaco from 'monaco-editor';

/**
 * 编辑器组件
 * @returns
 */
function Editor() {
    const editor_ref = useRef<HTMLDivElement>(null);

    // 编辑器的选项
    const editor_option = {
        automaticLayout: true, // 自适应布局
        scrollBeyondLastLine: false, // 取消代码后面空白
        fixedOverflowWidgets: true, // 超出编辑器大小的使用fixed属性显示
        theme: 'vs-dark',
        language: 'javascript',
        minimap: {
            enabled: false, // 不要小地图
        },
    } as monaco.editor.IEditorConstructionOptions;

    /**
     * 注册editor
     */
    const injectMonacoEditorWorker = () => {
        // eslint-disable-next-line
        (window as any).MonacoEnvironment = {
            /**
             * 动态获取worker URL
             *
             * @param _ - 占位符
             * @param label - editor类型
             * @returns
             */
            getWorkerUrl: function (_: number, label: string) {
                let filename = '';

                switch (label) {
                    case 'javascript':
                    case 'typescript':
                        filename = `ts.worker.js`;
                        break;
                    default:
                        filename = `editor.worker.js`;
                }

                const url = `https://wos2.58cdn.com.cn/MnOjIhGfMnSn/xinghuo/${filename}`;

                // worker 不支持跨域，需要这样加载
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                importScripts('${url}')
            `)}`;
            },
        };
    };

    useEffect(() => {
        if (editor_ref.current) {
            injectMonacoEditorWorker();
            const editor = monaco.editor.create(editor_ref.current, {
                value: `
const myrequire = require.config({
    // 指定一个隔离的 context，这里可以直接使用 chart.uuid
    context: chart.uuid,
    paths: {  // 配置库加载网址（注意网址没有 .js 后缀）
        echarts: '//c.58cdn.com.cn/git/cdn/echarts/4.8.0/echarts.min',
    }
});
                `,
                ...editor_option,
            });

            editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
                () => {
                    const value = editor.getValue();
                    console.log(value);
                },
            );

            editor.onDidChangeModelContent(() => {
                const value = editor.getValue();
                console.log(value);
            });
        }
    }, [editor_ref.current]);

    return (
        <div
            id="monaco_editor"
            style={{flex: 1, margin: 30}}
            ref={editor_ref}
        ></div>
    );
}

export default React.memo(Editor);
