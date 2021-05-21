import fs from 'fs';
import path from 'path';
import {Plugin} from 'vite';
import MagicString from 'magic-string';

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

const exclude_path = `monaco-editor/ems/vs`;

/**
 * 使用了monaco-editor-nls的语言映射包，把原始localize(data, message)的方法，替换成了localize(path, data, defaultMessage)
 * @param options 替换语言包
 * @returns
 */
export default function (options: Options = {locale: Languages.en_gb}): Plugin {
    const CURRENT_LOCALE_DATA = getLocalizeMapping(options.locale);

    return {
        name: 'rollup-plugin-monaco-editor-nls',

        enforce: 'pre',

        /** 处理vite在esbuild情况下预编译生成chunk找不到nls替换文件 */
        config: (config) => {
            config.optimizeDeps = config.optimizeDeps
                ? {
                      ...config.optimizeDeps,
                      exclude: config.optimizeDeps.exclude
                          ? [...config.optimizeDeps.exclude, exclude_path]
                          : [exclude_path],
                  }
                : {
                      exclude: [exclude_path],
                  };
            return config;
        },

        load(filepath) {
            if (/esm\/vs\/nls\.js/.test(filepath)) {
                const code = getLocalizeCode(CURRENT_LOCALE_DATA);
                return code;
            }
        },

        transform(code, filepath) {
            if (
                /monaco-editor[\\\/]esm[\\\/]vs.+\.js/.test(filepath) &&
                !/esm\/vs\/.*nls\.js/.test(filepath)
            ) {
                const re = /(?:monaco-editor\/esm\/)(.+)(?=\.js)/;
                if (re.exec(filepath) && code.includes('localize(')) {
                    const path = RegExp.$1;

                    if (JSON.parse(CURRENT_LOCALE_DATA)[path]) {
                        code = code.replace(
                            /localize\(/g,
                            `localize('${path}', `,
                        );
                    }

                    return {
                        code: code,
                        map: new MagicString(code).generateMap({
                            includeContent: true,
                            hires: true,
                            source: filepath,
                        }),
                    };
                }
            }
        },
    };
}

/**
 * 获取语言包
 * @param locale 语言
 * @returns
 */
function getLocalizeMapping(locale: Languages) {
    const locale_data_path = path.join(__dirname, `./locale/${locale}.json`);
    return fs.readFileSync(locale_data_path) as unknown as string;
}

/**
 * 替换代码
 * @param CURRENT_LOCALE_DATA 语言包
 * @returns
 */
function getLocalizeCode(CURRENT_LOCALE_DATA: string) {
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
