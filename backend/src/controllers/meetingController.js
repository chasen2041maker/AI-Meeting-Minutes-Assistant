import { transcribe, SUPPORTED_FORMATS, MAX_FILE_SIZE } from '../services/whisperService.js';
import { generateSummary } from '../services/summaryService.js';
import { deleteFile, isValidFileType } from '../utils/fileHandler.js';

/**
 * 音频转写控制器
 */
export async function transcribeAudio(req, res) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      error: '请上传音频文件'
    });
  }

  // 验证文件类型
  if (!isValidFileType(file.originalname, SUPPORTED_FORMATS)) {
    deleteFile(file.path);
    return res.status(400).json({
      success: false,
      error: `不支持的文件格式。支持的格式: ${SUPPORTED_FORMATS.join(', ')}`
    });
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    deleteFile(file.path);
    return res.status(400).json({
      success: false,
      error: '文件过大，最大支持 25MB'
    });
  }

  try {
    console.log('Starting transcription for file:', file.path);
    const language = req.body.language || null;
    const result = await transcribe(file.path, language);
    console.log('Transcription result:', result.success ? 'Success' : 'Failed');

    // 删除临时文件
    deleteFile(file.path);

    if (result.success) {
      return res.json({
        success: true,
        data: {
          text: result.text,
          duration: result.duration,
          language: result.language
        }
      });
    } else {
      console.error('Transcription failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Controller error:', error);
    deleteFile(file.path);
    return res.status(500).json({
      success: false,
      error: '转写过程中发生错误: ' + error.message
    });
  }
}

/**
 * 摘要生成控制器
 */
export async function summarizeText(req, res) {
  const { text, options = {} } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '请提供需要分析的文本'
    });
  }

  try {
    const result = await generateSummary(text, {
      model: options.model || 'gpt-4o-mini',
      includeActionItems: options.include_action_items !== false,
      includeDecisions: options.include_decisions !== false
    });

    if (result.success) {
      return res.json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: '摘要生成过程中发生错误'
    });
  }
}

/**
 * 一键处理控制器（转写 + 摘要）
 */
export async function processAudio(req, res) {
  const file = req.file;
  console.log('Processing audio request for file:', file?.path);

  if (!file) {
    return res.status(400).json({
      success: false,
      error: '请上传音频文件'
    });
  }

  // 验证文件类型
  if (!isValidFileType(file.originalname, SUPPORTED_FORMATS)) {
    deleteFile(file.path);
    return res.status(400).json({
      success: false,
      error: `不支持的文件格式。支持的格式: ${SUPPORTED_FORMATS.join(', ')}`
    });
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    deleteFile(file.path);
    return res.status(400).json({
      success: false,
      error: '文件过大，最大支持 25MB'
    });
  }

  try {
    // 步骤1: 转写音频
    const language = req.body.language || null;
    const transcribeResult = await transcribe(file.path, language);

    // 删除临时文件
    deleteFile(file.path);

    if (!transcribeResult.success) {
      return res.status(500).json({
        success: false,
        error: transcribeResult.error,
        step: 'transcribe'
      });
    }

    // 步骤2: 生成摘要
    const summaryResult = await generateSummary(transcribeResult.text);

    if (!summaryResult.success) {
      return res.status(500).json({
        success: false,
        error: summaryResult.error,
        step: 'summarize',
        transcription: {
          text: transcribeResult.text,
          duration: transcribeResult.duration,
          language: transcribeResult.language
        }
      });
    }

    return res.json({
      success: true,
      data: {
        transcription: {
          text: transcribeResult.text,
          duration: transcribeResult.duration,
          language: transcribeResult.language
        },
        summary: summaryResult.data
      }
    });
  } catch (error) {
    deleteFile(file.path);
    return res.status(500).json({
      success: false,
      error: '处理过程中发生错误'
    });
  }
}
