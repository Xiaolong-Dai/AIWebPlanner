import { useEffect, useState } from 'react';
import { Spin, Progress, Space } from 'antd';
import { RobotOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './index.css';

interface AILoadingIndicatorProps {
  message?: string;
  estimatedTime?: number; // 预计时间（秒）
  showProgress?: boolean; // 是否显示进度条
  tips?: string[]; // 提示信息列表
}

const AILoadingIndicator = ({
  message = 'AI 正在生成中',
  estimatedTime = 180, // 默认 3 分钟
  showProgress = true,
  tips = [
    '💡 AI 正在分析您的需求...',
    '🔍 正在搜索最佳旅行方案...',
    '📝 正在生成详细行程安排...',
    '✨ 即将完成，请稍候...',
  ],
}: AILoadingIndicatorProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // 计时器：每秒更新一次
    const timer = setInterval(() => {
      setElapsed((prev) => Math.min(prev + 1, estimatedTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [estimatedTime]);

  useEffect(() => {
    // 提示信息轮播
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000); // 每 3 秒切换一次提示

    return () => clearInterval(tipInterval);
  }, [tips.length]);

  // 计算进度百分比
  const progress = Math.min((elapsed / estimatedTime) * 100, 95); // 最多显示 95%

  // 格式化剩余时间
  const remainingSeconds = Math.max(estimatedTime - elapsed, 0);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;

  return (
    <div className="ai-loading-indicator">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* 主要加载动画 */}
        <div className="loading-header">
          <Spin
            indicator={
              <RobotOutlined
                style={{
                  fontSize: 32,
                  color: '#1890ff',
                }}
                spin
              />
            }
          />
          <div className="loading-message">{message}</div>
        </div>

        {/* 进度条 */}
        {showProgress && (
          <div className="loading-progress">
            <Progress
              percent={Math.floor(progress)}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={(percent) => `${percent}%`}
            />
          </div>
        )}

        {/* 预计剩余时间 */}
        <div className="loading-time">
          <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>预计还需 {timeText}</span>
        </div>

        {/* 提示信息 */}
        <div className="loading-tips">
          <div className="tip-item fade-in">{tips[currentTip]}</div>
        </div>

        {/* 友好提示 */}
        <div className="loading-notice">
          <div style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
            ⏳ AI 正在为您生成详细内容，这可能需要 3-5 分钟
          </div>
          <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 4 }}>
            🔄 服务正常运行中，请耐心等待
          </div>
        </div>
      </Space>
    </div>
  );
};

export default AILoadingIndicator;

