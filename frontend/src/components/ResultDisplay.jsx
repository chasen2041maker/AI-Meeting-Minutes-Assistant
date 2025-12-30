import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function ResultDisplay({ result }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  if (!result) return null;

  const { transcription, summary } = result;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleExportMarkdown = () => {
    let markdown = `# 会议记录\n\n`;
    markdown += `**生成时间**: ${new Date().toLocaleString()}\n\n`;

    if (transcription?.duration) {
      markdown += `**音频时长**: ${Math.round(transcription.duration)} 秒\n\n`;
    }

    markdown += `## 会议摘要\n\n${summary?.summary || '无'}\n\n`;

    if (summary?.topics_discussed?.length > 0) {
      markdown += `## 讨论主题\n\n`;
      summary.topics_discussed.forEach((topic) => {
        markdown += `- ${topic}\n`;
      });
      markdown += '\n';
    }

    if (summary?.key_decisions?.length > 0) {
      markdown += `## 关键决定\n\n`;
      summary.key_decisions.forEach((decision) => {
        markdown += `- ${decision}\n`;
      });
      markdown += '\n';
    }

    if (summary?.action_items?.length > 0) {
      markdown += `## 行动项\n\n`;
      markdown += `| 负责人 | 任务 | 截止时间 |\n`;
      markdown += `|--------|------|----------|\n`;
      summary.action_items.forEach((item) => {
        markdown += `| ${item.assignee || '未指定'} | ${item.task} | ${item.deadline || '未指定'} |\n`;
      });
      markdown += '\n';
    }

    if (summary?.participants?.length > 0) {
      markdown += `## 参会人员\n\n`;
      markdown += summary.participants.join('、') + '\n\n';
    }

    // 对话记录
    if (summary?.dialogue?.length > 0) {
      markdown += `## 对话记录\n\n`;
      summary.dialogue.forEach((item) => {
        markdown += `**${item.speaker}**: ${item.content}\n\n`;
      });
    }

    markdown += `## 原文转写\n\n${transcription?.text || '无'}\n`;

    // 下载文件
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `会议记录_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // 创建一个用于导出的临时 HTML 内容
      const pdfContent = document.createElement('div');
      pdfContent.innerHTML = `
        <div style="font-family: 'Microsoft YaHei', sans-serif; padding: 20px; color: #333;">
          <h1 style="font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">会议记录</h1>
          <p style="color: #666; margin-bottom: 20px;">生成时间: ${new Date().toLocaleString()} | 音频时长: ${Math.round(transcription?.duration || 0)} 秒</p>

          <h2 style="font-size: 18px; margin-top: 20px; color: #1a1a1a;">会议摘要</h2>
          <p style="line-height: 1.6; margin-bottom: 20px;">${summary?.summary || '无'}</p>

          ${summary?.topics_discussed?.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; color: #1a1a1a;">讨论主题</h2>
            <ul style="margin-bottom: 20px;">
              ${summary.topics_discussed.map(t => `<li style="margin: 5px 0;">${t}</li>`).join('')}
            </ul>
          ` : ''}

          ${summary?.key_decisions?.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; color: #1a1a1a;">关键决定</h2>
            <ul style="margin-bottom: 20px;">
              ${summary.key_decisions.map(d => `<li style="margin: 5px 0;">${d}</li>`).join('')}
            </ul>
          ` : ''}

          ${summary?.action_items?.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; color: #1a1a1a;">行动项</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">负责人</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">任务</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">截止时间</th>
                </tr>
              </thead>
              <tbody>
                ${summary.action_items.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.assignee || '未指定'}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.task}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.deadline || '未指定'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${summary?.participants?.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; color: #1a1a1a;">参会人员</h2>
            <p style="margin-bottom: 20px;">${summary.participants.join('、')}</p>
          ` : ''}

          ${summary?.dialogue?.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; color: #1a1a1a;">对话记录</h2>
            <div style="margin-bottom: 20px;">
              ${summary.dialogue.map(item => `
                <p style="margin: 10px 0;"><strong style="color: #2563eb;">${item.speaker}:</strong> ${item.content}</p>
              `).join('')}
            </div>
          ` : ''}

          <h2 style="font-size: 18px; margin-top: 20px; color: #1a1a1a;">原文转写</h2>
          <p style="line-height: 1.8; white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px;">${transcription?.text || '无'}</p>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `会议记录_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(pdfContent).save();
    } catch (err) {
      console.error('PDF 导出失败:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border" ref={contentRef}>
      {/* 标签栏 */}
      <div className="border-b flex">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'summary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          会议摘要
        </button>
        {summary?.dialogue?.length > 0 && (
          <button
            onClick={() => setActiveTab('dialogue')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'dialogue'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            对话记录
          </button>
        )}
        <button
          onClick={() => setActiveTab('transcript')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'transcript'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          原文转写
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {activeTab === 'summary' && summary && (
          <div className="space-y-6">
            {/* 摘要 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">摘要</h3>
              <p className="text-gray-800">{summary.summary}</p>
            </div>

            {/* 讨论主题 */}
            {summary.topics_discussed?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">讨论主题</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.topics_discussed.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 关键决定 */}
            {summary.key_decisions?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">关键决定</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-800">
                  {summary.key_decisions.map((decision, index) => (
                    <li key={index}>{decision}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 行动项 */}
            {summary.action_items?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">行动项</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          负责人
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          任务
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          截止时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summary.action_items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {item.assignee || '未指定'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800">{item.task}</td>
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {item.deadline || '未指定'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 参会人员 */}
            {summary.participants?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">参会人员</h3>
                <p className="text-gray-800">{summary.participants.join('、')}</p>
              </div>
            )}
          </div>
        )}

        {/* 对话记录标签页 */}
        {activeTab === 'dialogue' && summary?.dialogue?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 mb-4">对话记录（基于语义推断）</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {summary.dialogue.map((item, index) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                      {item.speaker?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600 mb-1">{item.speaker}</p>
                    <p className="text-gray-800">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 italic">
              * 说话人识别基于对话内容语义推断，可能不完全准确
            </p>
          </div>
        )}

        {activeTab === 'transcript' && transcription && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-500">
                {transcription.duration && (
                  <span>时长: {Math.round(transcription.duration)} 秒</span>
                )}
                {transcription.language && (
                  <span className="ml-4">语言: {transcription.language}</span>
                )}
              </div>
              <button
                onClick={() => handleCopy(transcription.text)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {copied ? '已复制' : '复制全文'}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p className="text-gray-800 whitespace-pre-wrap">{transcription.text}</p>
            </div>
          </div>
        )}
      </div>

      {/* 导出按钮 */}
      <div className="border-t px-4 py-3 flex justify-end gap-3">
        <button
          onClick={handleExportMarkdown}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
        >
          导出 Markdown
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {exporting ? '导出中...' : '导出 PDF'}
        </button>
      </div>
    </div>
  );
}
