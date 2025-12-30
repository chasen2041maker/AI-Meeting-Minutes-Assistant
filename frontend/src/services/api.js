import axios from 'axios';

const API_BASE = '/api';

/**
 * 上传音频文件并转写
 * @param {File} audioFile - 音频文件
 * @param {string} language - 语言代码（可选）
 * @param {function} onProgress - 上传进度回调
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function transcribeAudio(audioFile, language = null, onProgress = null) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  if (language) {
    formData.append('language', language);
  }

  try {
    const response = await axios.post(`${API_BASE}/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

/**
 * 生成会议摘要
 * @param {string} text - 会议文本
 * @param {object} options - 选项
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function generateSummary(text, options = {}) {
  try {
    const response = await axios.post(`${API_BASE}/summarize`, {
      text,
      options
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

/**
 * 一键处理：上传音频并生成摘要
 * @param {File} audioFile - 音频文件
 * @param {string} language - 语言代码（可选）
 * @param {function} onProgress - 上传进度回调
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function processAudio(audioFile, language = null, onProgress = null) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  if (language) {
    formData.append('language', language);
  }

  try {
    const response = await axios.post(`${API_BASE}/process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

/**
 * 健康检查
 */
export async function checkHealth() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
