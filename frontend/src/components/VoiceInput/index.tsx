import { useState, useEffect, useRef } from 'react';
import { Button, Space, Typography, message } from 'antd';
import { AudioOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { startSpeechRecognition, SpeechRecognizer } from '../../services/speech';
import './index.css';

const { Text } = Typography;

export interface VoiceInputProps {
  onResult: (text: string) => void;
  onCancel: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // 开始录音
  const startRecording = async () => {
    try {
      setError(null);
      setRecognizedText('');
      setIsRecording(true);

      console.log('🎤 开始语音识别...');

      recognizerRef.current = startSpeechRecognition(
        (text) => {
          // 实时更新识别结果
          console.log('📝 更新识别文本:', text);
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
            content: errorMsg,
            duration: 5,
          });
        }
      );

      await recognizerRef.current.start();
      console.log('✅ 语音识别已启动');
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
  const stopRecording = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
    setIsRecording(false);
  };

  // 确认输入
  const handleConfirm = () => {
    if (recognizedText.trim()) {
      onResult(recognizedText);
    } else {
      message.warning('未识别到语音内容');
    }
  };

  // 取消输入
  const handleCancel = () => {
    stopRecording();
    onCancel();
  };

  // 组件挂载时自动开始录音
  useEffect(() => {
    startRecording();

    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="voice-input">
      <div className="voice-input-content">
        {/* 录音动画 */}
        <div className={`voice-animation ${isRecording ? 'recording' : ''}`}>
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
          <AudioOutlined className="voice-icon" />
        </div>

        {/* 状态文本 */}
        <div className="voice-status">
          {isRecording ? (
            <Text strong style={{ fontSize: 16 }}>
              正在录音...
            </Text>
          ) : (
            <Text type="secondary">录音已停止</Text>
          )}
        </div>

        {/* 识别结果 */}
        {recognizedText && (
          <div className="recognized-text">
            <Text>{recognizedText}</Text>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="error-text">
            <Text type="danger">{error}</Text>
          </div>
        )}

        {/* 操作按钮 */}
        <Space size="large" style={{ marginTop: 20 }}>
          <Button
            size="large"
            icon={<CloseOutlined />}
            onClick={handleCancel}
          >
            取消
          </Button>
          {isRecording ? (
            <Button
              type="primary"
              size="large"
              danger
              onClick={stopRecording}
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
            >
              确认
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default VoiceInput;

