import { useState } from 'react';
import { Card, Timeline, Tag, Space, Typography, Divider, Button, Alert } from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CarOutlined,
  ShoppingOutlined,
  CoffeeOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  DownOutlined,
  UpOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { DayItinerary, Activity } from '../../types/common';
import './index.css';

const { Title, Text, Paragraph } = Typography;

export interface ItineraryCardProps {
  dayItinerary: DayItinerary;
  dayNumber: number;
  onActivityClick?: (activity: Activity, coordinates?: [number, number]) => void;
}

// 活动类型图标映射
const activityIcons: Record<string, React.ReactNode> = {
  attraction: <EnvironmentOutlined />,
  restaurant: <CoffeeOutlined />,
  shopping: <ShoppingOutlined />,
  transport: <CarOutlined />,
  accommodation: '🏨',
  entertainment: '🎭',
  other: '📌',
};

// 活动类型颜色映射
const activityColors: Record<string, string> = {
  attraction: 'blue',
  restaurant: 'orange',
  shopping: 'purple',
  transport: 'green',
  accommodation: 'magenta',
  entertainment: 'gold',
  other: 'default',
};

// 活动类型中文映射
const activityLabels: Record<string, string> = {
  attraction: '景点',
  restaurant: '餐饮',
  shopping: '购物',
  transport: '交通',
  accommodation: '住宿',
  entertainment: '娱乐',
  other: '其他',
};

const ItineraryCard: React.FC<ItineraryCardProps> = ({ dayItinerary, dayNumber, onActivityClick }) => {
  const [collapsed, setCollapsed] = useState(false);

  // 计算每日预算小计
  const calculateDailyBudget = () => {
    let total = 0;

    // 活动费用（优先使用 cost，如果没有则使用 ticket_price）
    dayItinerary.activities.forEach(activity => {
      // 如果有 cost 字段，使用 cost（通常已包含所有费用）
      if (activity.cost !== undefined && activity.cost !== null) {
        total += activity.cost;
      }
      // 如果没有 cost 但有 ticket_price，使用 ticket_price
      else if (activity.ticket_price !== undefined && activity.ticket_price !== null) {
        total += activity.ticket_price;
      }
    });

    // 城际交通费用（新增）
    if (dayItinerary.transportation && Array.isArray(dayItinerary.transportation)) {
      dayItinerary.transportation.forEach((trans: any) => {
        if (trans.price !== undefined && trans.price !== null) {
          total += trans.price;
        }
      });
    }

    // 住宿费用
    if (dayItinerary.accommodation?.price_per_night) {
      total += dayItinerary.accommodation.price_per_night;
    }

    // 餐饮费用（人均价格）
    if (dayItinerary.meals && Array.isArray(dayItinerary.meals)) {
      dayItinerary.meals.forEach(meal => {
        if (meal.price_per_person !== undefined && meal.price_per_person !== null) {
          total += meal.price_per_person;
        }
      });
    }

    return Math.round(total * 100) / 100; // 保留两位小数
  };

  // 渲染单个活动
  const renderActivity = (activity: Activity) => {
    const icon = activityIcons[activity.type] || <ClockCircleOutlined />;
    const color = activityColors[activity.type] || 'default';
    const label = activityLabels[activity.type] || '其他';

    // 交通活动特殊渲染
    if (activity.type === 'transport') {
      return (
        <div className="transport-activity">
          <div className="transport-header">
            <Space>
              <CarOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              <Text strong style={{ color: '#52c41a' }}>
                {(activity as any).method || '交通'}
              </Text>
            </Space>
            {activity.cost !== undefined && activity.cost !== null && (
              <Text type="danger" strong>
                {activity.cost === 0 ? '免费' : `¥${activity.cost}`}
              </Text>
            )}
          </div>
          <div className="transport-details">
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {(activity as any).from && (activity as any).to && (
                <Text type="secondary">
                  <EnvironmentOutlined /> {(activity as any).from} → {(activity as any).to}
                </Text>
              )}
              {(activity as any).details && (
                <Text type="secondary">
                  📋 {(activity as any).details}
                </Text>
              )}
              {activity.start_time && activity.end_time && (
                <Text type="secondary">
                  <ClockCircleOutlined /> {activity.start_time} - {activity.end_time}
                </Text>
              )}
              {activity.duration && (
                <Text type="secondary">
                  <FieldTimeOutlined /> 预计时长: {activity.duration}
                </Text>
              )}
              {activity.description && (
                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                  💡 {activity.description}
                </Text>
              )}
            </Space>
          </div>
        </div>
      );
    }

    // 获取位置信息 - 优先使用 address,其次使用 location 字符串
    const getLocationText = () => {
      if (activity.address && typeof activity.address === 'string') {
        return activity.address;
      }
      if (activity.location && typeof activity.location === 'string') {
        return activity.location;
      }
      return null;
    };

    const locationText = getLocationText();

    // 点击地址定位到地图
    const handleLocationClick = () => {
      if (activity.coordinates && onActivityClick) {
        onActivityClick(activity, activity.coordinates);
        // 调用全局方法定位地图
        if ((window as any).focusMapLocation) {
          (window as any).focusMapLocation(activity.coordinates[0], activity.coordinates[1]);
        }
      }
    };

    return (
      <div className="activity-item">
        <div className="activity-header">
          <Space>
            <Tag color={color} icon={icon}>
              {label}
            </Tag>
            <Text strong style={{ fontSize: 16 }}>{activity.name}</Text>
          </Space>
        </div>

        {/* 时间信息 */}
        <Space size="large" style={{ marginTop: 8 }}>
          {activity.start_time && activity.end_time ? (
            <div className="activity-meta">
              <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              <Text type="secondary">{activity.start_time} - {activity.end_time}</Text>
            </div>
          ) : activity.time ? (
            <div className="activity-meta">
              <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              <Text type="secondary">{activity.time}</Text>
            </div>
          ) : null}

          {activity.duration && (
            <div className="activity-meta">
              <FieldTimeOutlined style={{ marginRight: 4, color: '#52c41a' }} />
              <Text type="secondary">时长: {activity.duration}</Text>
            </div>
          )}
        </Space>

        {/* 地址 - 可点击定位 */}
        {locationText && (
          <div
            className="activity-location"
            onClick={handleLocationClick}
            style={{
              cursor: activity.coordinates ? 'pointer' : 'default',
              marginTop: 8,
            }}
          >
            <EnvironmentOutlined style={{ marginRight: 4, color: activity.coordinates ? '#1890ff' : '#999' }} />
            <Text
              type="secondary"
              style={{
                color: activity.coordinates ? '#1890ff' : undefined,
                textDecoration: activity.coordinates ? 'underline' : 'none',
              }}
            >
              {locationText}
            </Text>
            {activity.coordinates && (
              <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                (点击定位)
              </Text>
            )}
          </div>
        )}

        {/* 描述 */}
        {activity.description && (
          <Paragraph className="activity-description" style={{ marginTop: 8 }}>
            {activity.description}
          </Paragraph>
        )}

        {/* 费用信息 */}
        <Space size="large" style={{ marginTop: 8 }}>
          {activity.ticket_price !== undefined && activity.ticket_price !== null && (
            <div className="activity-meta">
              <DollarOutlined style={{ marginRight: 4, color: activity.ticket_price === 0 ? '#52c41a' : '#ff4d4f' }} />
              <Text type="secondary">门票: </Text>
              <Text strong style={{ color: activity.ticket_price === 0 ? '#52c41a' : '#ff4d4f' }}>
                {activity.ticket_price === 0 ? '免费' : `¥${activity.ticket_price}`}
              </Text>
            </div>
          )}

          {activity.cost !== undefined && activity.cost !== null && (
            <div className="activity-meta">
              <Text type="secondary">预计费用: </Text>
              <Text strong style={{ color: activity.cost === 0 ? '#52c41a' : '#ff4d4f' }}>
                {activity.cost === 0 ? '免费' : `¥${activity.cost}`}
              </Text>
            </div>
          )}
        </Space>

        {/* 开放时间 */}
        {activity.opening_hours && (
          <div className="activity-meta" style={{ marginTop: 8 }}>
            <ClockCircleOutlined style={{ marginRight: 4, color: '#faad14' }} />
            <Text type="secondary">开放时间: {activity.opening_hours}</Text>
          </div>
        )}

        {/* 提示 */}
        {activity.tips && (
          <div className="activity-tips" style={{ marginTop: 8 }}>
            <Text type="warning">💡 {activity.tips}</Text>
          </div>
        )}
      </div>
    );
  };

  const dailyBudget = calculateDailyBudget();

  return (
    <Card className="itinerary-card custom-card" hoverable>
      <div className="itinerary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ marginBottom: 8, fontSize: 18, fontWeight: 600, color: '#262626' }}>
            📅 第 {dayNumber} 天
            {dayItinerary.date && (
              <Text type="secondary" style={{ fontSize: 14, marginLeft: 12, fontWeight: 'normal' }}>
                {dayItinerary.date}
              </Text>
            )}
          </Title>
          {dayItinerary.theme && (
            <Tag color="cyan" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6 }}>
              {dayItinerary.theme}
            </Tag>
          )}
        </div>

        <Space size="middle">
          {/* 每日预算小计 */}
          {dailyBudget > 0 && (
            <Tag
              color="red"
              style={{
                fontSize: 14,
                padding: '6px 16px',
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              💰 预算: ¥{dailyBudget.toFixed(2)}
            </Tag>
          )}

          {/* 折叠/展开按钮 */}
          <Button
            type="text"
            size="middle"
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontWeight: 500 }}
          >
            {collapsed ? '展开' : '收起'}
          </Button>
        </Space>
      </div>

      {dayItinerary.summary && (
        <>
          <Paragraph className="itinerary-summary" style={{ marginTop: 12 }}>
            {dayItinerary.summary}
          </Paragraph>
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      {/* 可折叠的行程内容 */}
      {!collapsed && (
        <>
          <Timeline
            className="itinerary-timeline"
            items={dayItinerary.activities.map((activity, index) => ({
              key: index,
              dot: activityIcons[activity.type],
              color: activityColors[activity.type],
              children: renderActivity(activity),
            }))}
          />

          {/* 住宿信息 */}
          {dayItinerary.accommodation && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <div className="accommodation-info">
                <Title level={5}>🏨 住宿</Title>
                <div style={{ marginTop: 8 }}>
                  <Text strong>{dayItinerary.accommodation.name}</Text>
                  <div style={{ marginTop: 4 }}>
                    <EnvironmentOutlined style={{ marginRight: 4, color: '#999' }} />
                    <Text type="secondary">{dayItinerary.accommodation.address}</Text>
                  </div>
                  {dayItinerary.accommodation.price_per_night !== undefined && dayItinerary.accommodation.price_per_night !== null && (
                    <div style={{ marginTop: 4 }}>
                      <DollarOutlined style={{ marginRight: 4, color: dayItinerary.accommodation.price_per_night === 0 ? '#52c41a' : '#ff4d4f' }} />
                      <Text strong style={{ color: dayItinerary.accommodation.price_per_night === 0 ? '#52c41a' : '#ff4d4f' }}>
                        {dayItinerary.accommodation.price_per_night === 0 ? '免费' : `¥${dayItinerary.accommodation.price_per_night}/晚`}
                      </Text>
                    </div>
                  )}
                  {dayItinerary.accommodation.rating && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">⭐ {dayItinerary.accommodation.rating}分</Text>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 餐饮信息 */}
          {dayItinerary.meals && dayItinerary.meals.length > 0 && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <div className="meals-info">
                <Title level={5}>🍴 餐饮</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 8 }}>
                  {dayItinerary.meals.map((meal, index) => (
                    <div key={index} className="meal-item">
                      <Tag color="orange">{meal.type}</Tag>
                      <Text strong>{meal.name}</Text>
                      {meal.restaurant && <Text type="secondary"> - {meal.restaurant}</Text>}
                      <div style={{ marginTop: 4 }}>
                        <EnvironmentOutlined style={{ marginRight: 4, color: '#999' }} />
                        <Text type="secondary">{meal.address}</Text>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">菜系: {meal.cuisine}</Text>
                        {meal.price_per_person !== undefined && meal.price_per_person !== null && (
                          <>
                            <Divider type="vertical" />
                            <Text strong style={{ color: meal.price_per_person === 0 ? '#52c41a' : '#ff4d4f' }}>
                              {meal.price_per_person === 0 ? '免费' : `¥${meal.price_per_person}/人`}
                            </Text>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </Space>
              </div>
            </>
          )}

          {/* 城际交通信息 */}
          {dayItinerary.transportation && dayItinerary.transportation.length > 0 && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <div className="intercity-transport">
                <Title level={5}>
                  <Space>
                    <RocketOutlined />
                    <span>城际交通</span>
                  </Space>
                </Title>
                <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 8 }}>
                  {dayItinerary.transportation.map((trans: any, idx: number) => (
                    <Card
                      key={idx}
                      size="small"
                      style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}
                    >
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <RocketOutlined style={{ color: '#1890ff' }} />
                            <Text strong>
                              {trans.type === 'flight' ? '航班' : '高铁/火车'}
                              {(trans.flight_number || trans.train_number) ? `: ${trans.flight_number || trans.train_number}` : ''}
                            </Text>
                          </Space>
                          {trans.price && (
                            <Text type="danger" strong>¥{trans.price}</Text>
                          )}
                        </div>

                        <div>
                          <Text type="secondary">
                            <EnvironmentOutlined /> {trans.from} → {trans.to}
                          </Text>
                        </div>

                        <div>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {trans.departure_time} - {trans.arrival_time}
                          </Text>
                          {trans.duration && (
                            <Text type="secondary" style={{ marginLeft: 16 }}>
                              <FieldTimeOutlined /> {trans.duration}
                            </Text>
                          )}
                        </div>

                        {trans.notes && (
                          <Alert
                            message={trans.notes}
                            type="info"
                            showIcon
                            style={{ marginTop: 8 }}
                          />
                        )}

                        <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                          ℹ️ 以上信息仅供参考，实际票价和时刻请以购票平台为准
                        </Text>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </div>
            </>
          )}

          {dayItinerary.notes && (
            <div className="itinerary-notes">
              <Divider style={{ margin: '12px 0' }} />
              <Text type="secondary">📝 备注: {dayItinerary.notes}</Text>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ItineraryCard;

