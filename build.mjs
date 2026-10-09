import { mkdir, readFile, writeFile } from 'node:fs/promises';

const source = new URL('./registry/lib/components/live/danmaku-send-status/', import.meta.url);
const detector = await readFile(new URL('detector.mjs', source), 'utf8');
const component = await readFile(new URL('index.mjs', source), 'utf8');
const output = `(() => {\n'use strict';\n${detector.replaceAll('export function ', 'function ')}\n${component.replace(/^import .*;\r?\n/, '').replace('export const component =', 'const component =')}\nreturn component;\n})()\n`;
const target = new URL('./registry/dist/components/live/', import.meta.url);
await mkdir(target, { recursive: true });
await writeFile(new URL('danmaku-send-status.js', target), output);
console.log('已生成 registry/dist/components/live/danmaku-send-status.js');
