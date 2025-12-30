import 'dotenv/config';
import { transcribe } from './src/services/whisperService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试文件路径
const testFile = path.join(__dirname, '..', 'Record (online-voice-recorder.com).mp3');

console.log('='.repeat(50));
console.log('Whisper API 上传测试');
console.log('='.repeat(50));
console.log('测试文件:', testFile);

import fs from 'fs';
const stats = fs.statSync(testFile);
console.log('文件大小:', (stats.size / 1024).toFixed(2), 'KB');
console.log('');
console.log('开始上传...');
console.log('');

const startTime = Date.now();

const result = await transcribe(testFile, 'zh');

const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('');
console.log('='.repeat(50));
console.log('测试结果');
console.log('='.repeat(50));
console.log('耗时:', elapsed, '秒');
console.log('成功:', result.success);

if (result.success) {
  console.log('语言:', result.language);
  console.log('时长:', result.duration, '秒');
  console.log('转写内容:');
  console.log(result.text);
} else {
  console.log('错误:', result.error);
}
