import 'dotenv/config';
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import http from 'http';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}=== 开始诊断 ===${RESET}\n`);

// 1. 检查环境变量
console.log(`${YELLOW}[1/3] 检查环境变量...${RESET}`);
const apiKey = process.env.OPENAI_API_KEY;
const proxyUrl = process.env.PROXY_URL;
const port = process.env.PORT || 3000;

if (!apiKey) {
    console.error(`${RED}❌ 错误: 未找到 OPENAI_API_KEY。请检查 .env 文件。${RESET}`);
    process.exit(1);
} else {
    console.log(`${GREEN}✅ OPENAI_API_KEY 已配置 (${apiKey.substring(0, 10)}...)${RESET}`);
}

if (proxyUrl) {
    console.log(`${GREEN}✅ 代理已配置: ${proxyUrl}${RESET}`);
} else {
    console.log(`${YELLOW}⚠️ 警告: 未配置代理 (PROXY_URL)。如果在中国大陆，连接 OpenAI 可能会失败。${RESET}`);
}

// 2. 检查后端服务健康状态
console.log(`\n${YELLOW}[2/3] 检查本地后端服务 (http://localhost:${port}/api/health)...${RESET}`);

const checkServer = () => {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/health`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`${GREEN}✅ 后端服务运行正常: ${data}${RESET}`);
                    resolve(true);
                } else {
                    console.error(`${RED}❌ 后端服务返回错误状态码: ${res.statusCode}${RESET}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`${RED}❌ 无法连接到后端服务: ${err.message}${RESET}`);
            console.error(`${YELLOW}提示: 请确保你已经运行了 'npm start' 并且没有报错。${RESET}`);
            resolve(false);
        });
    });
};

// 3. 检查 OpenAI 连接
const checkOpenAI = async () => {
    console.log(`\n${YELLOW}[3/3] 检查 OpenAI 连接...${RESET}`);
    
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    
    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        httpAgent: agent,
        timeout: 10000 // 10秒超时
    });

    try {
        console.log('正在尝试列出模型列表 (这会验证 API Key 和网络连接)...');
        const list = await openai.models.list();
        console.log(`${GREEN}✅ OpenAI 连接成功!${RESET}`);
        console.log(`获取到了 ${list.data.length} 个模型。`);
        return true;
    } catch (error) {
        console.error(`${RED}❌ OpenAI 连接失败:${RESET}`);
        console.error(error.message);
        if (error.cause) {
            console.error('原因:', error.cause);
        }
        return false;
    }
};

async function run() {
    const serverOk = await checkServer();
    if (!serverOk) {
        console.log(`\n${RED}诊断结束: 本地服务未正常运行，请先解决此问题。${RESET}`);
        return;
    }

    const openaiOk = await checkOpenAI();
    if (openaiOk) {
        console.log(`\n${GREEN}=== 🎉 诊断通过! 所有服务看起来都正常。 ===${RESET}`);
        console.log(`${YELLOW}如果前端仍然报错 'Connection error'，请检查浏览器控制台 (F12) 的 Network 标签页，查看具体的请求错误。${RESET}`);
    } else {
        console.log(`\n${RED}=== 诊断失败: OpenAI 连接有问题。 ===${RESET}`);
        console.log(`${YELLOW}请检查代理地址是否正确，或者 API Key 是否有效。${RESET}`);
    }
}

run();
