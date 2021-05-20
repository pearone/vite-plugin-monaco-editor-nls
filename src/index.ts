import fs from 'fs';
import path from 'path';
import {Plugin} from 'rollup';

export enum Languages {
    bg = 'bg',
    cs = 'cs',
    de = 'de',
    en_gb = 'en-gb',
    es = 'es',
    fr = 'fr',
    hu = 'hu',
    id = 'id',
    it = 'it',
    ja = 'ja',
    ko = 'ko',
    nl = 'nl',
    pl = 'pl',
    ps = 'ps',
    pt_br = 'pt-br',
    ru = 'ru',
    tr = 'tr',
    uk = 'uk',
    zh_hans = 'zh-hans',
    zh_hant = 'zh-hant',
}

export interface Options {
    locale: Languages;
}

/**
 * 使用了monaco-editor-nls的语言映射包，把原始localize(data, message)的方法，替换成了localize(path, data, defaultMessage)
 * @param options 替换语言包
 * @returns
 */
export default function (options: Options = {locale: Languages.es}): Plugin {
    return {
        name: 'rollup-plugin-monaco-editor-nls',

        /** 处理vite在esbuild情况下预编译生成chunk找不到nls替换文件 */
        // config: (config) => {
        //     config.optimizeDeps = config.optimizeDeps
        //         ? {
        //               ...config.optimizeDeps,
        //               exclude: config.optimizeDeps.exclude
        //                   ? [...config.optimizeDeps.exclude, `monaco-editor`]
        //                   : [`monaco-editor`],
        //           }
        //         : {
        //               exclude: [`monaco-editor`],
        //           };
        //     return config;
        // },

        load(filepath) {
            if (/esm\/vs\/nls\.js/.test(filepath)) {
                const code = getLocalizeCode(options.locale);
                return code;
            }
        },

        transform(code, filepath) {
            if (
                /monaco-editor[\\\/]esm[\\\/]vs.+\.js/.test(filepath) &&
                !/esm\/vs\/.*nls\.js/.test(filepath)
            ) {
                const re = /(?:monaco-editor\/esm\/)(.+)(?=\.js)/;
                if (re.exec(filepath)) {
                    const path = RegExp.$1;
                    code = code.replace(/localize\(/g, `localize('${path}', `);
                    const map = this.getCombinedSourcemap();

                    return {
                        code: code,
                        map,
                    };
                }
            }

            return {
                code: code,
                map: null,
            };
        },
    };
}

function getLocalizeCode(locale: Languages) {
    const locale_data_path = path.join(__dirname, `./locale/${locale}.json`);

    const CURRENT_LOCALE_DATA = fs.readFileSync(locale_data_path);

    return `
        function _format(message, args) {
            var result;
            if (args.length === 0) {
                result = message;
            } else {
                result = String(message).replace(/\{(\d+)\}/g, function (match, rest) {
                    var index = rest[0];
                    return typeof args[index] !== 'undefined' ? args[index] : match;
                });
            }
            return result;
        }

        export function localize(path, data, defaultMessage) {
            var key = typeof data === 'object' ? data.key : data;
            var data = ${CURRENT_LOCALE_DATA} || {};
            var message = (data[path] || {})[key];
            if (!message) {
                message = defaultMessage;
            }
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            return _format(message, args);
        }
    `;
}
