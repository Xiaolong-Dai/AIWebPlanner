import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Space, Typography, message, Progress, Tag } from 'antd';
import {
  AudioOutlined,
  CloseOutlined,
  CheckOutlined,
  SoundOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { startSpeechRecognition, SpeechRecognizer } from '../../services/speech';
import './index.css';

const { Text, Paragraph } = Typography;

export interface VoiceInputProps {
  onResult: (text: string) => void;
  onCancel: () => void;
  maxDuration?: number; // 最大录音时长（秒），默认60秒
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  onCancel,
  maxDuration = 60
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [tempText, setTempText] = useState(''); // 临时识别结果
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0); // 音量 0-100
  const [duration, setDuration] = useState(0); // 录音时长（秒）
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const durationTimerRef = useRef<number | null>(null);

  // 音量检测
  const detectVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // 计算平均音量
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const volumePercent = Math.min(100, (average / 128) * 100);
    setVolume(volumePercent);

    animationFrameRef.current = requestAnimationFrame(detectVolume);
  }, []);

  // 开始录音
  const startRecording = async () => {
    try {
      setError(null);
      setRecognizedText('');
      setTempText('');
      setVolume(0);
      setDuration(0);
      setIsRecording(true);

      console.log('🎤 开始语音识别...');

      // 获取麦克风并设置音量检测
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // 开始音量检测
      detectVolume();

      // 开始计时
      durationTimerRef.current = window.setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            // 达到最大时长，自动停止
            message.info(`已达到最大录音时长 ${maxDuration} 秒，自动停止`);
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      recognizerRef.current = startSpeechRecognition(
        (text) => {
          // 实时更新识别结果
          console.log('📝 更新识别文本:', text);
          setTempText(text);
          setRecognizedText(text);
        },
        (err) => {
          console.error('❌ 语音识别错误:', err);
          setError(err.message);
          setIsRecording(false);

          // 提供更友好的错误提示
          let errorMsg = err.message;
          if (err.message.includes('未配置')) {
            errorMsg = '请先在设置页面配置科大讯飞 API';
          } else if (err.message.includes('NotAllowedError') || err.message.includes('Permission denied')) {
            errorMsg = '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问';
          } else if (err.message.includes('NotFoundError')) {
            errorMsg = '未检测到麦克风设备，请检查麦克风连接';
          } else if (err.message.includes('连接失败')) {
            errorMsg = '语音识别服务连接失败，请检查网络连接';
          }

          message.error({
            content: (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 语音识别错误</div>
                <div>{errorMsg}</div>
              </div>
            ),
            duration: 5,
          });
        }
      );

      await recognizerRef.current.start();
      console.log('✅ 语音识别已启动');

      message.success({
        content: '🎤 开始录音，请说话...',
        duration: 2,
      });
    } catch (err: any) {
      console.error('❌ 启动语音识别失败:', err);
      setError(err.message);
      setIsRecording(false);

      // 提供更友好的错误提示
      let errorMsg = err.message;
      if (err.message.includes('未配置')) {
        errorMsg = '请先在设置页面配置科大讯飞 API (App ID, API Key, API Secret)';
      } else if (err.message.includes('NotAllowedError') || err.message.includes('Permission denied')) {
        errorMsg = '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问';
      } else if (err.message.includes('NotFoundError')) {
        errorMsg = '未检测到麦克风设备，请检查麦克风是否正确连接';
      }

      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 启动语音识别失败</div>
            <div>{errorMsg}</div>
          </div>
        ),
        duration: 6,
      });
    }
  };

  // 停止录音
  const stopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }

    // 停止音量检测
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 停止计时
    if (durationTimerRef.current) {
      window.clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // 关闭音频上下文
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setVolume(0);

    if (recognizedText) {
      message.success({
        content: '✅ 录音已停止',
        duration: 2,
      });
    }
  }, [recognizedText]);

  // 确认输入
  const handleConfirm = () => {
    if (recognizedText.trim()) {
      message.success({
        content: '✅ 语音输入成功',
        duration: 2,
      });
      onResult(recognizedText);
    } else {
      message.warning({
        content: '⚠️ 未识别到语音内容，请重新录音',
        duration: 3,
      });
    }
  };

  // 取消输入
  const handleCancel = () => {
    stopRecording();
    onCancel();
  };

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter' && !isRecording && recognizedText) {
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, recognizedText]);

  // 组件挂载时自动开始录音
  useEffect(() => {
    startRecording();

    return () => {
      stopRecording();
    };
  }, []);

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-input">
      <div className="voice-input-content">
        {/* 录音动画和音量可视化 */}
        <div className={`voice-animation ${isRecording ? 'recording' : ''}`}>
          <div className="wave wave-1" style={{ opacity: volume / 100 }}></div>
          <div className="wave wave-2" style={{ opacity: volume / 150 }}></div>
          <div className="wave wave-3" style={{ opacity: volume / 200 }}></div>
          <div className="voice-icon-wrapper">
            <AudioOutlined className="voice-icon" />
            {isRecording && (
              <div className="recording-indicator">
                <span className="recording-dot"></span>
              </div>
            )}
          </div>
        </div>

        {/* 音量条 */}
        {isRecording && (
          <div className="volume-bar">
            <SoundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <Progress
              percent={volume}
              showInfo={false}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ flex: 1 }}
            />
          </div>
        )}

        {/* 状态文本和时长 */}
        <div className="voice-status">
          {isRecording ? (
            <Space direction="vertical" align="center" size={4}>
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                🎤 正在录音...
              </Text>
              <Space size={8}>
                <Tag color="processing">{formatDuration(duration)}</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  最长 {maxDuration} 秒
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                点击"停止录音"或说完后等待2秒
              </Text>
            </Space>
          ) : (
            <Space direction="vertical" align="center" size={4}>
              <Text type="secondary">录音已停止</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                按 Enter 确认 / ESC 取消
              </Text>
            </Space>
          )}
        </div>

        {/* 识别结果 */}
        {(recognizedText || tempText) && (
          <div className="recognized-text">
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 14 }}>识别结果：</Text>
              {recognizedText && (
                <Tag color="success">已识别 {recognizedText.length} 字</Tag>
              )}
            </div>
            <Paragraph
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.8,
                color: isRecording ? '#666' : '#000'
              }}
            >
              {recognizedText || tempText || '等待语音输入...'}
            </Paragraph>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="error-text">
            <Text type="danger">❌ {error}</Text>
          </div>
        )}

        {/* 操作按钮 */}
        <Space size="large" style={{ marginTop: 20 }}>
          <Button
            size="large"
            icon={<CloseOutlined />}
            onClick={handleCancel}
            style={{
              minWidth: 100,
              height: 44,
              borderRadius: 8,
            }}
          >
            取消 (ESC)
          </Button>
          {isRecording ? (
            <Button
              type="primary"
              size="large"
              danger
              icon={<PauseCircleOutlined />}
              onClick={stopRecording}
              style={{
                minWidth: 120,
                height: 44,
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              停止录音
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={handleConfirm}
              disabled={!recognizedText}
              style={{
                minWidth: 120,
                height: 44,
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              确认 (Enter)
            </Button>
          )}
        </Space>

        {/* 提示信息 */}
        {!error && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 提示：说话时保持清晰，避免环境噪音
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;

