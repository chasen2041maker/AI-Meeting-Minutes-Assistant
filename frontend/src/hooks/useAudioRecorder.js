import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // 选择最佳的 MIME 类型
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // 每秒收集一次数据
      setIsRecording(true);
      setRecordingTime(0);

      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('录音启动失败:', err);
      if (err.name === 'NotAllowedError') {
        setError('麦克风权限被拒绝，请在浏览器设置中允许使用麦克风');
      } else if (err.name === 'NotFoundError') {
        setError('未检测到麦克风设备');
      } else {
        setError('无法启动录音: ' + err.message);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      // 停止计时
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current.mimeType
        });

        // 停止所有音轨
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());

        // 创建 File 对象
        const extension = mediaRecorderRef.current.mimeType.includes('webm') ? 'webm' : 'mp4';
        const fileName = `recording_${Date.now()}.${extension}`;
        const file = new File([audioBlob], fileName, { type: mediaRecorderRef.current.mimeType });

        setIsRecording(false);
        resolve(file);
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }

    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, [isRecording]);

  return {
    isRecording,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    cancelRecording
  };
}
