import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';

const agent = process.env.PROXY_URL ? new HttpsProxyAgent(process.env.PROXY_URL, {
  keepAlive: true,
  timeout: 300000,  // 5分钟超时
  keepAliveMsecs: 30000
}) : undefined;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  httpAgent: agent,
  timeout: 300000  // 5分钟超时
});

const SYSTEM_PROMPT = `你是一个专业的会议记录助手。请分析以下会议转写文本，并生成结构化的会议记录。

请严格按照以下 JSON 格式输出，不要包含任何其他文字：

{
  "summary": "会议摘要（100-200字）",
  "key_decisions": [
    "关键决定1",
    "关键决定2"
  ],
  "action_items": [
    {
      "assignee": "负责人姓名",
      "task": "具体任务内容",
      "deadline": "截止时间（如有提及）"
    }
  ],
  "participants": ["参会人员列表（如能识别）"],
  "topics_discussed": ["讨论主题1", "讨论主题2"],
  "dialogue": [
    {
      "speaker": "说话人标识（如：发言人A、张总、主持人等）",
      "content": "发言内容摘要"
    }
  ]
}

注意事项：
1. 如果无法识别某些信息，对应字段返回空数组或 "未提及"
2. 行动项必须包含明确的负责人和任务
3. 摘要要简洁但涵盖主要内容
4. dialogue 字段：尝试从语义、称呼、语气等推断不同说话人，按发言顺序记录主要对话
5. 如果能从对话中识别出人名（如"张总"、"李经理"），使用具体人名作为 speaker
6. 如果无法识别具体人名，使用"发言人A"、"发言人B"等标识区分不同说话人
7. dialogue 只记录重要发言，不需要记录所有内容`;

/**
 * 生成会议摘要
 * @param {string} transcriptText - 会议转写文本
 * @param {object} options - 选项配置
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function generateSummary(transcriptText, options = {}) {
  try {
    const {
      model = 'gpt-4o-mini',
      includeActionItems = true,
      includeDecisions = true
    } = options;

    const response = await openai.chat.completions.create({
      model: model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `请分析以下会议内容：\n\n${transcriptText}` }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content);

    // 根据选项过滤返回内容
    if (!includeActionItems) {
      delete result.action_items;
    }
    if (!includeDecisions) {
      delete result.key_decisions;
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Chat API 错误:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 生成简短摘要
 * @param {string} text - 文本内容
 * @param {number} maxLength - 最大长度
 * @returns {Promise<{success: boolean, summary?: string, error?: string}>}
 */
export async function generateBriefSummary(text, maxLength = 200) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的摘要助手。请用不超过${maxLength}字简洁地总结以下内容的要点。`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return {
      success: true,
      summary: response.choices[0].message.content
    };
  } catch (error) {
    console.error('Chat API 错误:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
