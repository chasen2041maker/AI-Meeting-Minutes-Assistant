import { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export default function FileUpload({ onFileSelect, selectedFile, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return `不支持的格式。支持: ${SUPPORTED_FORMATS.join(', ')}`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return '文件过大。最大 25MB。';
    }

    return null;
  };

  const handleFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center py-16 px-10 min-h-[300px] text-center cursor-pointer
          transition-all duration-300 ease-out border-2 border-dashed rounded-xl
          ${dragOver 
            ? 'scale-[1.02] border-slate-400 bg-slate-50' 
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept={SUPPORTED_FORMATS.map(f => `.${f}`).join(',')}
          className="hidden"
          disabled={disabled}
        />

        <div className={`
          p-4 rounded-full mb-4 transition-colors duration-300
          ${dragOver ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}
        `}>
          <Upload size={32} strokeWidth={1.5} />
        </div>

        <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
          {selectedFile ? '更换文件' : '点击或拖拽上传'}
        </h3>
        
        <p className="font-body text-slate-500 text-sm max-w-xs mx-auto">
          {selectedFile 
            ? `已选择: ${selectedFile.name}`
            : `支持的格式: ${SUPPORTED_FORMATS.join(', ').toUpperCase()}`
          }
        </p>

        {error && (
          <div className="absolute -bottom-12 left-0 w-full flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

