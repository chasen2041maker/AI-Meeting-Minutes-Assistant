# AI 会议记录助手 (AI Meeting Assistant)

这是一个基于 AI 的智能会议记录工具，能够将会议录音自动转录为文字，并生成结构化的会议纪要、关键决策和行动项。

## ✨ 功能特性

*   **音频转录**：支持多种音频格式（MP3, WAV, M4A 等）的高精度转录。
*   **智能摘要**：利用 AI 自动生成会议摘要，提取核心内容。
*   **结构化输出**：自动整理讨论主题、关键决策和待办事项（Action Items）。
*   **双模式输入**：支持上传本地音频文件或直接在浏览器中录音。
*   **现代化 UI**：基于 React 和 Tailwind CSS 构建的优雅、响应式界面。

## 🛠 技术栈

### 前端 (Frontend)
*   **框架**: React 18
*   **构建工具**: Vite
*   **样式**: Tailwind CSS, Framer Motion (动画)
*   **图标**: Lucide React

### 后端 (Backend)
*   **运行时**: Node.js
*   **框架**: Express
*   **AI 服务**: OpenAI API (Whisper 模型用于转录, GPT 模型用于摘要)
*   **文件处理**: Multer

## 🚀 快速开始

### 1. 环境准备
确保您的电脑已安装 [Node.js](https://nodejs.org/) (推荐 v16+)。

### 2. 获取代码
```bash
git clone <您的仓库地址>
cd web_project_2
```

### 3. 后端设置
进入后端目录并安装依赖：
```bash
cd backend
npm install
```

配置环境变量：
1.  复制 `.env.example` 文件并重命名为 `.env`。
2.  在 `.env` 文件中填入您的 OpenAI API Key。

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

### 4. 前端设置
进入前端目录并安装依赖：
```bash
cd ../frontend
npm install
```

### 5. 运行项目

#### 开发模式 (前后端独立热更新)
需要打开两个终端窗口：

终端 1 (后端):
```bash
cd backend
npm start
```

终端 2 (前端):
```bash
cd frontend
npm run dev
```
访问: `http://localhost:5173`

#### 生产/部署模式 (前后端一体)
只需构建一次前端，然后启动后端即可：

```bash
# 1. 构建前端
cd frontend
npm run build

# 2. 启动后端
cd ../backend
npm start
```
访问: `http://localhost:3000`

## 📂 项目结构

```
web_project_2/
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── controllers/    # 业务逻辑
│   │   ├── routes/         # API 路由
│   │   ├── services/       # AI 服务封装
│   │   └── index.js        # 入口文件
│   ├── uploads/            # 临时上传目录
│   └── .env                # 配置文件 (不要上传到 GitHub)
│
├── frontend/                # 前端代码
│   ├── src/
│   │   ├── components/     # React 组件
│   │   └── services/       # API 调用
│   └── dist/               # 构建产物
│
└── README.md               # 项目说明
```

## ⚠️ 注意事项

*   请确保 `.env` 文件不要上传到公共仓库（已在 `.gitignore` 中配置）。
*   上传的音频文件会临时存储在 `backend/uploads` 目录中。
*   本项目依赖 OpenAI API，使用过程中会产生相应的 API 调用费用。

## 📄 许可证

MIT License
