import { useAudioRecorder } from '../hooks/useAudioRecorder';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioRecorder({ onRecordingComplete, disabled }) {
  const {
    isRecording,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    cancelRecording
  } = useAudioRecorder();

  const handleStop = async () => {
    const file = await stopRecording();
    if (file) {
      onRecordingComplete(file);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        {!isRecording ? (
          <>
            <button
              onClick={startRecording}
              disabled={disabled}
              className={`
                inline-flex items-center justify-center w-16 h-16 rounded-full
                bg-red-500 hover:bg-red-600 text-white transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <p className="mt-4 text-sm text-gray-600">点击开始录音</p>
          </>
        ) : (
          <>
            {/* 录音状态 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-red-600 font-medium">录音中</span>
            </div>

            {/* 录音时长 */}
            <p className="text-2xl font-mono text-gray-800 mb-6">
              {formatTime(recordingTime)}
            </p>

            {/* 操作按钮 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelRecording}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleStop}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                停止并处理
              </button>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
