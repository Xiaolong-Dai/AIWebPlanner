import { useState, useEffect } from 'react';
import { Popover, Button, Space, Typography } from 'antd';
import { CloseOutlined, BulbOutlined } from '@ant-design/icons';
import './index.css';

const { Text } = Typography;

interface FeatureTipProps {
  id: string; // 唯一标识，用于记录是否已显示
  title: string;
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  autoShow?: boolean; // 是否自动显示
  delay?: number; // 延迟显示时间（毫秒）
}

const FeatureTip = ({
  id,
  title,
  content,
  children,
  placement = 'right',
  autoShow = true,
  delay = 1000,
}: FeatureTipProps) => {
  const [visible, setVisible] = useState(false);
  const storageKey = `feature_tip_${id}`;

  useEffect(() => {
    if (!autoShow) return;

    // 检查是否已经显示过
    const hasShown = localStorage.getItem(storageKey);
    if (hasShown) return;

    // 延迟显示
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [autoShow, delay, storageKey]);

  const handleClose = () => {
    setVisible(false);
    // 记录已显示
    localStorage.setItem(storageKey, 'true');
  };

  const tipContent = (
    <div className="feature-tip-content">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div className="feature-tip-header">
          <Space>
            <BulbOutlined style={{ color: '#faad14', fontSize: 16 }} />
            <Text strong style={{ color: '#262626' }}>
              {title}
            </Text>
          </Space>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleClose}
            style={{ marginLeft: 8 }}
          />
        </div>
        <Text style={{ fontSize: 13, color: '#595959', lineHeight: 1.6 }}>
          {content}
        </Text>
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <Button type="link" size="small" onClick={handleClose}>
            知道了
          </Button>
        </div>
      </Space>
    </div>
  );

  return (
    <Popover
      content={tipContent}
      open={visible}
      onOpenChange={setVisible}
      placement={placement}
      overlayClassName="feature-tip-popover"
      trigger="click"
    >
      {children}
    </Popover>
  );
};

export default FeatureTip;

