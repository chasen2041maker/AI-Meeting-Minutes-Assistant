import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 上传目录
export const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/**
 * 确保上传目录存在
 */
export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * 删除临时文件
 * @param {string} filePath - 文件路径
 */
export function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('删除文件失败:', error.message);
  }
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 扩展名（小写，不含点）
 */
export function getFileExtension(filename) {
  return path.extname(filename).toLowerCase().slice(1);
}

/**
 * 验证文件类型
 * @param {string} filename - 文件名
 * @param {string[]} allowedTypes - 允许的类型列表
 * @returns {boolean}
 */
export function isValidFileType(filename, allowedTypes) {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
}

/**
 * 生成唯一文件名
 * @param {string} originalName - 原始文件名
 * @returns {string}
 */
export function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}${ext}`;
}
