import fs from 'fs';
import path from 'path';
import { ProxyAgent } from 'undici';

// 使用 undici ProxyAgent，对文件上传兼容性更好
const dispatcher = process.env.PROXY_URL
  ? new ProxyAgent({
      uri: process.env.PROXY_URL,
      requestTls: { timeout: 300000 }
    })
  : undefined;

console.log('WhisperService initialized with proxy:', process.env.PROXY_URL || 'none');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

/**
 * 音频转写服务 - 使用原生 fetch
 * @param {string} filePath - 音频文件路径
 * @param {string} language - 语言代码（可选，如 'zh'、'en'）
 * @returns {Promise<{success: boolean, text?: string, duration?: number, error?: string}>}
 */
export async function transcribe(filePath, language = null) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // 构建 FormData
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), fileName);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    if (language) {
      formData.append('language', language);
    }

    console.log('Sending request to OpenAI Whisper API via native fetch...');

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    };

    // 如果有代理，添加 dispatcher
    if (dispatcher) {
      fetchOptions.dispatcher = dispatcher;
    }

    const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error response:', errorText);
      return {
        success: false,
        error: `API 错误: ${response.status} - ${errorText}`
      };
    }

    const transcription = await response.json();
    console.log('Whisper API response received.');

    return {
      success: true,
      text: transcription.text,
      duration: transcription.duration,
      language: transcription.language
    };
  } catch (error) {
    console.error('Whisper API 详细错误:', error);
    return {
      success: false,
      error: error.message || 'OpenAI 连接失败'
    };
  }
}

/**
 * 获取支持的音频格式
 */
export const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];

/**
 * 最大文件大小（25MB）
 */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
