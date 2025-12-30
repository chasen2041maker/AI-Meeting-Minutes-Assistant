import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import meetingRoutes from './routes/meeting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 (指向前端构建产物)
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// 路由
app.use('/api', meetingRoutes);

// API 根路由 (移动到 /api)
app.get('/api', (req, res) => {
  res.json({
    message: 'AI 会议记录系统 API',
    version: '1.0.0',
    endpoints: {
      transcribe: 'POST /api/transcribe',
      summarize: 'POST /api/summarize',
      process: 'POST /api/process',
      health: 'GET /api/health'
    }
  });
});

// 所有其他请求返回前端 index.html (支持前端路由)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// 404 处理 (仅针对 /api 开头的路径，因为其他路径都由前端接管了)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);

  // Multer 文件大小错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: '文件过大，最大支持 25MB'
    });
  }

  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('可用接口:');
  console.log(`  - POST /api/transcribe  音频转写`);
  console.log(`  - POST /api/summarize   生成摘要`);
  console.log(`  - POST /api/process     一键处理`);
  console.log(`  - GET  /api/health      健康检查`);
});

process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});
