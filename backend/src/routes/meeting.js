import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  transcribeAudio,
  summarizeText,
  processAudio
} from '../controllers/meetingController.js';
import { generateUniqueFilename, ensureUploadDir, UPLOAD_DIR } from '../utils/fileHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 确保上传目录存在
ensureUploadDir();

// 配置 Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  }
});

/**
 * POST /api/transcribe
 * 音频转写接口
 */
router.post('/transcribe', upload.single('audio'), transcribeAudio);

/**
 * POST /api/summarize
 * 摘要生成接口
 */
router.post('/summarize', summarizeText);

/**
 * POST /api/process
 * 一键处理接口（转写 + 摘要）
 */
router.post('/process', upload.single('audio'), processAudio);

/**
 * GET /api/health
 * 健康检查接口
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API 服务正常运行',
    timestamp: new Date().toISOString()
  });
});

export default router;
