import { useState } from 'react';
import { FloatButton, Modal, Tabs, Typography, Space, Card, Tag, Divider } from 'antd';
import {
  QuestionCircleOutlined,
  RocketOutlined,
  BulbOutlined,
  KeyOutlined,
  BookOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import './index.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const GlobalHelp = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* 全局帮助按钮 */}
      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setVisible(true)}
        tooltip="使用帮助"
        badge={{ dot: false }}
      />

      {/* 帮助对话框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QuestionCircleOutlined style={{ color: '#1890ff' }} />
            <span>使用帮助</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
        className="global-help-modal"
      >
        <Tabs defaultActiveKey="quickstart" size="large">
          {/* 快速开始 */}
          <TabPane
            tab={
              <span>
                <RocketOutlined />
                快速开始
              </span>
            }
            key="quickstart"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card>
                <Title level={4}>🎯 创建第一个旅行计划</Title>
                <Paragraph>
                  <ol style={{ paddingLeft: 20 }}>
                    <li>
                      <Text strong>点击"创建计划"</Text> - 在左侧菜单或首页点击
                    </li>
                    <li>
                      <Text strong>与 AI 对话</Text> - 告诉 AI 你的旅行需求
                      <br />
                      <Text type="secondary">
                        例如："我想去日本东京，5天，预算1万元，喜欢美食和动漫"
                      </Text>
                    </li>
                    <li>
                      <Text strong>使用语音输入</Text> - 点击麦克风图标，直接说出需求
                    </li>
                    <li>
                      <Text strong>等待 AI 生成</Text> - AI 会在 3-5 分钟内生成详细行程
                    </li>
                    <li>
                      <Text strong>查看和编辑</Text> - 在地图上查看路线，编辑行程细节
                    </li>
                  </ol>
                </Paragraph>
              </Card>

              <Card>
                <Title level={4}>💰 管理旅行预算</Title>
                <Paragraph>
                  <ol style={{ paddingLeft: 20 }}>
                    <li>
                      <Text strong>选择计划</Text> - 在"预算管理"页面选择旅行计划
                    </li>
                    <li>
                      <Text strong>记录费用</Text> - 点击"添加费用"，支持语音快速录入
                      <br />
                      <Text type="secondary">
                        语音示例："午餐花了50块" 或 "出租车费30元"
                      </Text>
                    </li>
                    <li>
                      <Text strong>查看统计</Text> - 查看费用分类、预算执行情况
                    </li>
                    <li>
                      <Text strong>AI 分析</Text> - 点击"AI预算分析"获取优化建议
                    </li>
                  </ol>
                </Paragraph>
              </Card>

              <Card>
                <Title level={4}>🗺️ 查看地图路线</Title>
                <Paragraph>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>在行程详情页面，点击"地图视图"标签</li>
                    <li>所有景点、酒店、餐厅会在地图上标注</li>
                    <li>点击标记可查看详细信息</li>
                    <li>支持缩放、拖动查看不同区域</li>
                  </ul>
                </Paragraph>
              </Card>
            </Space>
          </TabPane>

          {/* 使用技巧 */}
          <TabPane
            tab={
              <span>
                <BulbOutlined />
                使用技巧
              </span>
            }
            key="tips"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card>
                <Title level={5}>💡 AI 对话技巧</Title>
                <Paragraph>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>
                      <Text strong>一次性说明所有需求</Text>
                      <br />
                      <Text type="secondary">
                        "我想去巴黎，7天，预算2万，喜欢艺术和美食，从北京出发，2个人"
                      </Text>
                    </li>
                    <li>
                      <Text strong>分步骤回答</Text>
                      <br />
                      <Text type="secondary">
                        AI 会逐步询问：目的地 → 日期 → 天数 → 预算 → 人数 → 偏好
                      </Text>
                    </li>
                    <li>
                      <Text strong>随时调整</Text>
                      <br />
                      <Text type="secondary">
                        生成后可以说"增加一天" 或 "预算改为1.5万"
                      </Text>
                    </li>
                  </ul>
                </Paragraph>
              </Card>

              <Card>
                <Title level={5}>🎤 语音输入技巧</Title>
                <Paragraph>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>
                      <Text strong>清晰发音</Text> - 在安静环境下使用，说话清晰
                    </li>
                    <li>
                      <Text strong>自然语言</Text> - 像平时说话一样，不需要特殊格式
                    </li>
                    <li>
                      <Text strong>费用录入</Text> - "午餐50" "出租车30" "门票80"
                    </li>
                    <li>
                      <Text strong>检查识别</Text> - 语音识别后会显示文字，确认无误再发送
                    </li>
                  </ul>
                </Paragraph>
              </Card>

              <Card>
                <Title level={5}>⚡ 性能优化技巧</Title>
                <Paragraph>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>
                      <Text strong>AI 生成需要时间</Text> - 通常 3-5 分钟，请耐心等待
                    </li>
                    <li>
                      <Text strong>避免重复提交</Text> - 等待进度条完成，不要重复点击
                    </li>
                    <li>
                      <Text strong>保存草稿</Text> - 行程生成后会自动保存，可随时编辑
                    </li>
                    <li>
                      <Text strong>离线查看</Text> - 已保存的行程可以离线查看
                    </li>
                  </ul>
                </Paragraph>
              </Card>

              <Card>
                <Title level={5}>🔒 安全提示</Title>
                <Paragraph>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>
                      <Text strong>API Key 安全</Text> - 配置的 API Key 会加密存储在本地
                    </li>
                    <li>
                      <Text strong>定期备份</Text> - 重要行程建议导出保存
                    </li>
                    <li>
                      <Text strong>隐私保护</Text> - 旅行数据仅存储在您的账户中
                    </li>
                  </ul>
                </Paragraph>
              </Card>
            </Space>
          </TabPane>

          {/* 快捷键 */}
          <TabPane
            tab={
              <span>
                <KeyOutlined />
                快捷键
              </span>
            }
            key="shortcuts"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card>
                <Title level={5}>⌨️ 全局快捷键</Title>
                <div className="shortcut-list">
                  <div className="shortcut-item">
                    <Tag color="blue">Ctrl + K</Tag>
                    <Text>快速搜索</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="blue">Ctrl + N</Tag>
                    <Text>创建新计划</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="blue">Ctrl + S</Tag>
                    <Text>保存当前编辑</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="blue">Ctrl + /</Tag>
                    <Text>显示帮助</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="blue">Esc</Tag>
                    <Text>关闭对话框</Text>
                  </div>
                </div>
              </Card>

              <Card>
                <Title level={5}>💬 对话界面快捷键</Title>
                <div className="shortcut-list">
                  <div className="shortcut-item">
                    <Tag color="green">Enter</Tag>
                    <Text>发送消息</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="green">Shift + Enter</Tag>
                    <Text>换行</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="green">Ctrl + V</Tag>
                    <Text>开始语音输入</Text>
                  </div>
                </div>
              </Card>

              <Card>
                <Title level={5}>📝 编辑界面快捷键</Title>
                <div className="shortcut-list">
                  <div className="shortcut-item">
                    <Tag color="orange">Ctrl + Z</Tag>
                    <Text>撤销</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="orange">Ctrl + Y</Tag>
                    <Text>重做</Text>
                  </div>
                  <div className="shortcut-item">
                    <Tag color="orange">Ctrl + D</Tag>
                    <Text>删除当前项</Text>
                  </div>
                </div>
              </Card>
            </Space>
          </TabPane>

          {/* 常见问题 */}
          <TabPane
            tab={
              <span>
                <BookOutlined />
                常见问题
              </span>
            }
            key="faq"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Card>
                <Title level={5}>❓ AI 生成速度很慢怎么办？</Title>
                <Paragraph>
                  <Text>
                    AI 生成详细行程需要 3-5 分钟，这是正常现象。系统会显示实时进度和预计剩余时间。
                    如果超过 5 分钟仍未完成，可以：
                  </Text>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>检查网络连接是否正常</li>
                    <li>刷新页面重新尝试</li>
                    <li>简化需求描述，减少复杂度</li>
                  </ul>
                </Paragraph>
              </Card>

              <Card>
                <Title level={5}>❓ 语音识别不准确怎么办？</Title>
                <Paragraph>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>确保在安静的环境中使用</li>
                    <li>说话清晰，语速适中</li>
                    <li>使用普通话或标准英语</li>
                    <li>识别后检查文字，手动修改错误</li>
                    <li>如果持续不准确，可以直接使用文字输入</li>
                  </ul>
                </Paragraph>
              </Card>

              <Card>
                <Title level={5}>❓ 如何修改已生成的行程？</Title>
                <Paragraph>
                  <ol style={{ paddingLeft: 20 }}>
                    <li>在"我的行程"页面找到要修改的计划</li>
                    <li>点击"编辑"按钮</li>
                    <li>可以修改每日行程、景点、时间等</li>
                    <li>也可以在对话中告诉 AI："修改第二天的行程"</li>
                    <li>修改后点击"保存"</li>
                  </ol>
                </Paragraph>
              </Card>

              <Card>
                <Title level={5}>❓ API Key 配置失败怎么办？</Title>
                <Paragraph>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>检查 API Key 是否正确复制（无多余空格）</li>
                    <li>确认 API Key 是否已激活和有效</li>
                    <li>检查账户余额是否充足</li>
                    <li>使用"测试连接"功能验证配置</li>
                    <li>查看浏览器控制台的错误信息</li>
                  </ul>
                </Paragraph>
              </Card>

              <Card>
                <Title level={5}>❓ 数据会丢失吗？</Title>
                <Paragraph>
                  <Text>
                    所有数据都会自动保存到云端（Supabase），不会丢失。建议：
                  </Text>
                  <ul style={{ paddingLeft: 20 }}>
                    <li>重要行程可以导出为 PDF 或 Excel</li>
                    <li>定期检查数据同步状态</li>
                    <li>不要在多个设备同时编辑同一行程</li>
                  </ul>
                </Paragraph>
              </Card>
            </Space>
          </TabPane>

          {/* 视频教程 */}
          <TabPane
            tab={
              <span>
                <VideoCameraOutlined />
                视频教程
              </span>
            }
            key="videos"
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card>
                <Title level={4}>📹 视频教程（即将推出）</Title>
                <Paragraph>
                  我们正在制作详细的视频教程，敬请期待！
                </Paragraph>
                <Divider />
                <Title level={5}>计划中的教程：</Title>
                <ul style={{ paddingLeft: 20 }}>
                  <li>🎬 快速入门 - 5分钟创建第一个旅行计划</li>
                  <li>🎬 语音输入 - 如何高效使用语音功能</li>
                  <li>🎬 预算管理 - 记录和分析旅行费用</li>
                  <li>🎬 地图功能 - 在地图上规划路线</li>
                  <li>🎬 高级技巧 - AI 对话的最佳实践</li>
                </ul>
              </Card>
            </Space>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default GlobalHelp;

