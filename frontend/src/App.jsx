import { useState } from 'react';
import FileUpload from './components/FileUpload';
import AudioRecorder from './components/AudioRecorder';
import ResultDisplay from './components/ResultDisplay';
import { processAudio } from './services/api';
import Layout from './components/Layout';
import { Upload, Mic, RefreshCw, Globe } from 'lucide-react';

function App() {
  const [mode, setMode] = useState('upload'); // 'upload' | 'record'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(''); // 语言选择

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
    setResult(null);
  };

  const handleRecordingComplete = (file) => {
    setSelectedFile(file);
    setError('');
    setResult(null);
    // 自动开始处理录音文件
    handleProcess(file);
  };

  const handleProcess = async (file = selectedFile) => {
    if (!file) {
      setError('请先选择或录制音频文件');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus('正在上传文件...');
    setError('');
    setResult(null);

    try {
      const response = await processAudio(file, language || null, (percent) => {
        setProgress(percent);
        if (percent === 100) {
          setStatus('文件上传完成，正在处理...');
        }
      });

      if (response.success) {
        setResult(response.data);
        setStatus('处理完成');
      } else {
        setError(response.error || '处理失败');
        setStatus('');
      }
    } catch (err) {
      setError(err.message || '处理过程中发生错误');
      setStatus('');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
    setStatus('');
    setProgress(0);
  };

  return (
    <Layout>
      <div className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              AI 会议助手
            </h1>
            <p className="font-body text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              使用我们先进的转录引擎，将您的会议音频转化为结构化的可操作见解。
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-8 md:p-12 relative overflow-hidden">
            {/* Decorative top line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200"></div>

            {/* Mode Switcher */}
            <div className="flex justify-center gap-6 mb-12">
              <button
                onClick={() => setMode('upload')}
                className={`group flex items-center gap-3 px-6 py-3 text-sm font-heading font-bold uppercase tracking-wider transition-all duration-300 border-b-2 ${
                  mode === 'upload'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Upload size={18} className={mode === 'upload' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'} />
                上传音频
              </button>
              <button
                onClick={() => setMode('record')}
                className={`group flex items-center gap-3 px-6 py-3 text-sm font-heading font-bold uppercase tracking-wider transition-all duration-300 border-b-2 ${
                  mode === 'record'
                    ? 'border-red-500 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Mic size={18} className={mode === 'record' ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-600'} />
                录制音频
              </button>
            </div>

            {/* Input Area */}
            <div className="mb-10 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors p-8">
              {mode === 'upload' ? (
                <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
              ) : (
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              )}
            </div>

            {/* Actions */}
            {selectedFile && !isProcessing && !result && (
              <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 text-slate-700 font-body italic">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  已选择: {selectedFile.name}
                </div>

                {/* 语言选择 */}
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-slate-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-2 border border-slate-200 bg-white text-slate-700 font-body text-sm focus:outline-none focus:border-slate-400 transition-colors"
                  >
                    <option value="">自动检测语言</option>
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <button
                  onClick={() => handleProcess()}
                  className="px-10 py-4 bg-slate-900 text-white font-heading font-bold uppercase tracking-widest text-sm hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  开始处理
                </button>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="text-center py-8 animate-in fade-in duration-500">
                <div className="w-full max-w-md mx-auto bg-slate-100 h-1 mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="font-heading font-bold text-slate-900 uppercase tracking-wide text-sm animate-pulse">
                  {status || '处理中...'} {Math.round(progress)}%
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 text-center font-body">
                {error}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-12 pt-12 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-heading text-2xl font-bold text-slate-900">会议纪要</h2>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-heading font-bold uppercase tracking-wide"
                  >
                    <RefreshCw size={16} />
                    重新开始
                  </button>
                </div>
                <ResultDisplay result={result} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
