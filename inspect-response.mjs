import { readFile } from 'node:fs/promises';
import { classifyResponse } from './registry/lib/components/live/danmaku-send-status/detector.mjs';

const response = JSON.parse(await readFile(process.argv[2], 'utf8'));
console.log(JSON.stringify({ ...classifyResponse(response), response }, null, 2));
