# AI Web Planner - 待完成功能详细需求文档

**文档版本**：v1.0  
**创建日期**：2025-10-30  
**当前项目完成度**：75%

---

## 📋 目录

1. [高优先级功能](#高优先级功能)
2. [中优先级功能](#中优先级功能)
3. [低优先级功能](#低优先级功能)
4. [开发计划建议](#开发计划建议)

---

## 🔴 高优先级功能

### 功能 1：景点间交通规划

#### 📌 功能描述
在 AI 生成的行程中，为每两个相邻景点之间自动添加交通信息，包括交通方式、具体路线、预计时间和费用。

#### 🎯 需求背景
- **用户痛点**：当前行程只显示景点列表，用户不知道如何从一个景点到达另一个景点
- **需求来源**：项目需求文档 2.1 节 - "交通方案（航班、高铁、市内交通）"
- **优先级**：🔴 高（核心功能）

#### ✅ 验收标准

1. **AI 生成的交通信息**：
   - ✅ 每两个相邻景点之间有交通活动
   - ✅ 交通方式明确（步行、地铁、公交、出租车、网约车）
   - ✅ 包含具体路线（如"地铁1号线，3站"）
   - ✅ 包含预计时间（如"20分钟"）
   - ✅ 包含预计费用（数字类型，如 3 元）

2. **UI 显示**：
   - ✅ 行程卡片中显示交通信息
   - ✅ 交通活动有独特的图标和颜色
   - ✅ 显示出发地和目的地
   - ✅ 显示交通方式和详细信息

3. **地图展示**：
   - ✅ 地图上标记交通路线
   - ✅ 交通路线与景点路线区分显示

#### 🛠️ 技术实现方案

**步骤 1：修改 AI Prompt**

**文件**：`frontend/src/services/llm.ts`

**位置**：`generateTravelPlan` 函数的 `systemPrompt`（约第 228 行）

**修改内容**：

```typescript
const systemPrompt = `你是一个专业的旅行规划助手。请根据用户需求生成详细的旅行计划。
要求：
1. 必须直接返回纯 JSON 对象，不要包含任何 markdown 标记（如 \`\`\`json）
2. 不要对 JSON 进行转义，直接返回原始 JSON 对象
3. JSON 中的字符串值可以包含中文，但不要使用转义的引号（\"）
4. 包含每日详细行程
5. 包含交通、住宿、餐饮、景点推荐
6. 考虑时间安排的合理性
7. 提供预算建议
8. 确保返回的内容可以被 JSON.parse() 直接解析

⚠️ 重要坐标要求：
- 每个景点(attraction)、餐厅(restaurant)、住宿(accommodation)都必须包含 coordinates 字段
- coordinates 格式必须是数组: [经度, 纬度]，例如: [116.397428, 39.90923]
- 经度在前，纬度在后
- 坐标必须是真实的地理坐标，不能是虚假数据
- 如果不确定坐标，请使用该城市的知名地标坐标

💰 重要价格要求：
- 所有价格字段（ticket_price、cost、price_per_night、price_per_person）必须是数字类型
- 免费的景点/活动，ticket_price 和 cost 必须设置为 0（数字零），不要省略这些字段
- 例如：天安门广场、公园等免费景点，必须写 "ticket_price": 0, "cost": 0
- 付费景点必须提供真实的门票价格
- 不要使用字符串 "免费"，必须使用数字 0

🚗 重要交通要求（新增）：
- 每两个相邻活动之间必须插入一个交通活动（type: "transport"）
- 交通方式选择规则：
  * 步行距离 < 1km：使用"步行"
  * 1km ≤ 距离 < 3km：使用"地铁"或"公交"
  * 距离 ≥ 3km：使用"地铁"、"公交"或"出租车"
- 必须提供具体信息：
  * method: 交通方式（步行、地铁、公交、出租车、网约车）
  * details: 具体路线（如"地铁1号线，天安门东站→王府井站，2站"）
  * duration: 预计时间（如"15分钟"）
  * cost: 预计费用（数字类型，步行为0）
  * from: 出发地点名称
  * to: 目的地点名称
- 交通时间要合理，考虑等车、换乘时间
- 交通费用要真实（地铁通常2-5元，公交1-2元，出租车起步价13元）

🎯 用户指定景点要求：
${specificAttractions.length > 0 ? `- 用户明确要求访问以下景点：${specificAttractions.join('、')}
- 请务必将这些景点纳入行程安排中，作为核心景点
- 这些景点的优先级最高，必须包含在行程中
- 在这些景点周围安排其他相关景点和活动` : '- 用户未指定具体景点，请根据目的地推荐热门景点'}

重要：直接返回 JSON 对象，不要返回 JSON 字符串的字符串形式！`;
```

**步骤 2：更新 JSON 示例**

**位置**：`userPrompt` 中的 JSON 示例（约第 281 行）

**修改内容**：

```typescript
userPrompt += `

请返回以下 JSON 格式（注意 coordinates 和价格字段格式）：
{
  "destination": "目的地城市",
  "itinerary": [
    {
      "day": 1,
      "date": "2024-06-01",
      "theme": "主题",
      "summary": "当日概述",
      "activities": [
        {
          "id": "act1",
          "type": "attraction",
          "name": "故宫博物院",
          "address": "北京市东城区景山前街4号",
          "coordinates": [116.397428, 39.90923],
          "start_time": "09:00",
          "end_time": "12:00",
          "duration": "3小时",
          "ticket_price": 60,
          "cost": 60,
          "description": "中国明清两代的皇家宫殿",
          "opening_hours": "08:30-17:00",
          "tips": "建议提前网上购票"
        },
        {
          "id": "trans1",
          "type": "transport",
          "name": "前往景山公园",
          "from": "故宫博物院",
          "to": "景山公园",
          "method": "步行",
          "details": "从故宫北门出，步行约5分钟",
          "start_time": "12:00",
          "end_time": "12:05",
          "duration": "5分钟",
          "cost": 0,
          "description": "步行前往景山公园"
        },
        {
          "id": "act2",
          "type": "attraction",
          "name": "景山公园",
          "address": "北京市西城区景山西街44号",
          "coordinates": [116.395, 39.928],
          "start_time": "12:05",
          "end_time": "13:00",
          "duration": "55分钟",
          "ticket_price": 2,
          "cost": 2,
          "description": "登高俯瞰故宫全景",
          "opening_hours": "06:30-21:00",
          "tips": "登万春亭可俯瞰故宫"
        },
        {
          "id": "trans2",
          "type": "transport",
          "name": "前往午餐地点",
          "from": "景山公园",
          "to": "全聚德烤鸭店（王府井店）",
          "method": "地铁",
          "details": "地铁8号线，南锣鼓巷站→王府井站，2站",
          "start_time": "13:00",
          "end_time": "13:15",
          "duration": "15分钟",
          "cost": 3,
          "description": "乘坐地铁8号线前往王府井"
        },
        {
          "id": "meal1",
          "type": "restaurant",
          "name": "全聚德烤鸭店（王府井店）",
          "address": "北京市东城区王府井大街198号",
          "coordinates": [116.410, 39.915],
          "start_time": "13:15",
          "end_time": "14:30",
          "duration": "1小时15分钟",
          "cost": 150,
          "description": "品尝正宗北京烤鸭",
          "cuisine": "北京菜",
          "price_per_person": 150
        }
      ],
      "accommodation": {
        "name": "北京饭店",
        "address": "北京市东城区东长安街33号",
        "location": { "lat": 39.9, "lng": 116.4 },
        "price_per_night": 500,
        "rating": 4.5
      },
      "transportation": [
        {
          "type": "flight",
          "from": "上海虹桥机场",
          "to": "北京首都机场",
          "departure_time": "08:00",
          "arrival_time": "10:30",
          "price": 800,
          "duration": "2小时30分钟",
          "flight_number": "CA1234（参考）",
          "notes": "建议提前2小时到达机场"
        }
      ],
      "meals": [
        {
          "type": "lunch",
          "name": "全聚德烤鸭店（王府井店）",
          "address": "北京市东城区王府井大街198号",
          "location": { "lat": 39.915, "lng": 116.410 },
          "cuisine": "北京菜",
          "price_per_person": 150,
          "rating": 4.5
        }
      ],
      "notes": "第一天行程较轻松，主要游览故宫及周边"
    }
  ],
  "suggestions": "旅行建议和注意事项"
}

⚠️ 再次强调：
1. activities 数组中的每个元素都必须包含 coordinates: [经度, 纬度]（transport 类型除外）
2. 景点(type: "attraction")、餐厅(type: "restaurant")、购物(type: "shopping")都必须有 coordinates
3. 交通(type: "transport")必须包含 from、to、method、details、duration、cost 字段
4. 每两个非交通活动之间必须插入一个交通活动
5. 坐标格式: [经度, 纬度]，例如东京塔: [139.745438, 35.658581]
6. 请使用真实的地理坐标，可以参考知名地标的实际位置`;
```

**步骤 3：修改行程卡片显示**

**文件**：`frontend/src/components/ItineraryCard/index.tsx`

**位置**：`renderActivity` 函数（约第 87 行）

**修改内容**：

在现有的活动渲染逻辑中添加交通活动的特殊处理：

```typescript
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
              {activity.method || '交通'}
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
            {activity.from && activity.to && (
              <Text type="secondary">
                <EnvironmentOutlined /> {activity.from} → {activity.to}
              </Text>
            )}
            {activity.details && (
              <Text type="secondary">
                📋 {activity.details}
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
          </Space>
        </div>
      </div>
    );
  }

  // 原有的景点/餐厅/购物等活动渲染逻辑
  // ... 保持不变
};
```

**步骤 4：添加交通活动样式**

**文件**：`frontend/src/components/ItineraryCard/index.css`

**新增内容**：

```css
.transport-activity {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
}

.transport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.transport-details {
  padding-left: 24px;
}

.transport-activity .ant-space-item {
  line-height: 1.8;
}
```

#### 📊 测试用例

**测试用例 1：基本交通信息生成**

**输入**：
```
目的地：北京
天数：2天
预算：2000元
人数：2人
偏好：历史文化
```

**预期输出**：
- ✅ 每两个景点之间有交通活动
- ✅ 交通方式合理（近距离步行，远距离地铁/公交）
- ✅ 包含具体路线信息
- ✅ 费用为数字类型

**测试用例 2：UI 显示**

**操作**：
1. 生成包含交通信息的行程
2. 查看行程卡片

**预期结果**：
- ✅ 交通活动显示为绿色背景
- ✅ 显示交通方式图标
- ✅ 显示出发地和目的地
- ✅ 显示详细路线
- ✅ 显示时间和费用

#### ⏱️ 工作量估算
- **开发时间**：2-3 小时
- **测试时间**：1 小时
- **总计**：3-4 小时

#### 📝 注意事项
1. AI 生成的交通信息是参考信息，需提示用户实际出行时确认
2. 交通费用可能因时间、路线变化而不同
3. 确保交通活动的时间与前后活动衔接合理

---

### 功能 2：真实路线规划（高德地图 API）

#### 📌 功能描述
使用高德地图的路线规划 API，在地图上显示真实的道路路线，而不是直线连接，并提供准确的距离和时间信息。

#### 🎯 需求背景
- **用户痛点**：当前地图显示的是直线连接，不符合实际道路，时间估算不准确
- **需求来源**：用户反馈 + 项目需求文档
- **优先级**：🔴 高（核心功能）

#### ✅ 验收标准

1. **路线显示**：
   - ✅ 地图上显示真实的道路路线
   - ✅ 路线沿着实际道路绘制
   - ✅ 不同天的路线用不同颜色区分

2. **距离和时间**：
   - ✅ 显示真实的道路距离（而非直线距离）
   - ✅ 显示基于路况的预计时间
   - ✅ 支持多种交通方式（驾车、步行、公交）

3. **交互功能**：
   - ✅ 点击路线显示详细信息
   - ✅ 可切换不同交通方式查看路线
   - ✅ 显示路线的详细步骤

#### 🛠️ 技术实现方案

**步骤 1：集成高德地图路线规划服务**

**文件**：`frontend/src/components/MapView/index.tsx`

**位置**：在 `useEffect` 中添加路线规划逻辑（约第 310 行，替换现有的直线路线绘制）

**修改内容**：

```typescript
// 绘制每天的路线(使用真实路线规划)
if (dayPoints.length > 1) {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2'];
  
  // 创建路线规划服务
  const driving = new window.AMap.Driving({
    map: mapRef.current,
    policy: window.AMap.DrivingPolicy.LEAST_TIME, // 最快路线
    hideMarkers: true, // 隐藏默认标记
  });

  const walking = new window.AMap.Walking({
    map: mapRef.current,
    hideMarkers: true,
  });

  // 遍历相邻点，计算真实路线
  for (let i = 0; i < dayPoints.length - 1; i++) {
    const startPoint = dayPoints[i];
    const endPoint = dayPoints[i + 1];

    // 计算直线距离判断使用哪种交通方式
    const straightDistance = window.AMap.GeometryUtil.distance(startPoint, endPoint);
    const distanceKm = straightDistance / 1000;

    // 根据距离选择交通方式
    const service = distanceKm < 1 ? walking : driving;
    const transportMode = distanceKm < 1 ? '步行' : '驾车';

    // 搜索路线
    service.search(startPoint, endPoint, (status: string, result: any) => {
      if (status === 'complete' && result.routes && result.routes.length > 0) {
        const route = result.routes[0];
        const distance = (route.distance / 1000).toFixed(1); // 公里
        const duration = Math.round(route.time / 60); // 分钟

        // 绘制路线
        const path = route.steps.flatMap((step: any) => step.path);
        const polyline = new window.AMap.Polyline({
          path: path,
          strokeColor: colors[dayIndex % colors.length],
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          showDir: true, // 显示方向箭头
        });
        mapRef.current.add(polyline);

        // 计算路线中点位置
        const midIndex = Math.floor(path.length / 2);
        const midPoint = path[midIndex];

        // 创建距离和时间标签
        const labelContent = document.createElement('div');
        labelContent.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          color: ${colors[dayIndex % colors.length]};
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          white-space: nowrap;
          border: 2px solid ${colors[dayIndex % colors.length]};
        `;
        labelContent.innerHTML = `${transportMode} ${distance}km / ${duration}分钟`;

        const labelMarker = new window.AMap.Marker({
          position: midPoint,
          content: labelContent,
          offset: new window.AMap.Pixel(-40, -15),
          zIndex: 200,
        });

        // 添加点击事件显示详细路线
        labelMarker.on('click', () => {
          const steps = route.steps.map((step: any, idx: number) => 
            `${idx + 1}. ${step.instruction}`
          ).join('<br>');

          const infoWindow = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 300px;">
                <h4 style="margin: 0 0 8px 0; color: ${colors[dayIndex % colors.length]};">
                  ${transportMode}路线详情
                </h4>
                <p style="margin: 4px 0; font-weight: bold;">
                  📏 距离: ${distance} 公里
                </p>
                <p style="margin: 4px 0; font-weight: bold;">
                  ⏱️ 时间: ${duration} 分钟
                </p>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
                  <p style="margin: 0 0 8px 0; font-weight: bold;">详细步骤:</p>
                  <div style="font-size: 12px; line-height: 1.6; max-height: 200px; overflow-y: auto;">
                    ${steps}
                  </div>
                </div>
              </div>
            `,
          });
          infoWindow.open(mapRef.current, midPoint);
        });

        markers.push(labelMarker);
      } else {
        console.warn(`路线规划失败: ${startPoint} -> ${endPoint}`, status, result);
        
        // 如果路线规划失败，回退到直线显示
        const polyline = new window.AMap.Polyline({
          path: [startPoint, endPoint],
          strokeColor: colors[dayIndex % colors.length],
          strokeWeight: 3,
          strokeOpacity: 0.6,
          strokeStyle: 'dashed', // 使用虚线表示这是估算路线
        });
        mapRef.current.add(polyline);
      }
    });
  }
}
```

**步骤 2：添加交通方式切换功能**

**文件**：`frontend/src/components/MapView/index.tsx`

**新增状态和UI**：

```typescript
const [routeMode, setRouteMode] = useState<'driving' | 'walking' | 'transit'>('driving');

// 在地图容器上方添加交通方式切换按钮
return (
  <div className="map-view" style={{ height }}>
    {/* 交通方式切换按钮 */}
    <div className="route-mode-selector">
      <Space>
        <Button
          type={routeMode === 'driving' ? 'primary' : 'default'}
          icon={<CarOutlined />}
          onClick={() => setRouteMode('driving')}
        >
          驾车
        </Button>
        <Button
          type={routeMode === 'walking' ? 'primary' : 'default'}
          icon={<WalkOutlined />}
          onClick={() => setRouteMode('walking')}
        >
          步行
        </Button>
        <Button
          type={routeMode === 'transit' ? 'primary' : 'default'}
          icon={<SubwayOutlined />}
          onClick={() => setRouteMode('transit')}
        >
          公交
        </Button>
      </Space>
    </div>

    {loading && (
      <div className="map-loading">
        <Spin size="large" tip="加载地图中...">
          <div style={{ minHeight: 100 }} />
        </Spin>
      </div>
    )}
    <div ref={mapContainerRef} className="map-container" style={{ height: '100%' }} />
  </div>
);
```

**步骤 3：添加样式**

**文件**：`frontend/src/components/MapView/index.css`

**新增内容**：

```css
.route-mode-selector {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

#### 📊 测试用例

**测试用例 1：驾车路线**

**操作**：
1. 生成包含多个景点的行程
2. 查看地图
3. 选择"驾车"模式

**预期结果**：
- ✅ 路线沿着道路绘制
- ✅ 显示真实的道路距离
- ✅ 显示预计驾车时间
- ✅ 点击路线显示详细步骤

**测试用例 2：步行路线**

**操作**：
1. 选择"步行"模式
2. 查看近距离景点之间的路线

**预期结果**：
- ✅ 路线适合步行
- ✅ 时间估算合理
- ✅ 显示步行距离

#### ⏱️ 工作量估算
- **开发时间**：4-6 小时
- **测试时间**：2 小时
- **总计**：6-8 小时

#### 📝 注意事项
1. 高德地图 API 有调用次数限制，需注意配额
2. 路线规划可能失败（如无法到达），需要错误处理
3. 公交路线规划较复杂，可能需要额外处理

---

## 🟡 中优先级功能

### 功能 3：费用语音录入

#### 📌 功能描述
在费用管理页面添加语音输入功能，用户可以通过语音快速录入旅行开销。

#### 🎯 需求背景
- **用户痛点**：旅行中手动输入费用不便，特别是在移动设备上
- **需求来源**：项目需求文档 2.2 节 - "支持语音录入（推荐方式）"
- **优先级**：🟡 中（重要功能）

#### ✅ 验收标准

1. **语音识别**：
   - ✅ 支持语音输入费用金额
   - ✅ 支持语音输入费用类别
   - ✅ 支持语音输入费用描述
   - ✅ 识别准确率 > 80%

2. **自动填充**：
   - ✅ 识别结果自动填充到表单
   - ✅ 支持手动修改识别结果
   - ✅ 提供识别结果预览

3. **用户体验**：
   - ✅ 语音按钮位置明显
   - ✅ 录音状态清晰提示
   - ✅ 支持重新录音

#### 🛠️ 技术实现方案

**步骤 1：在费用录入对话框中添加语音按钮**

**文件**：`frontend/src/pages/Budget.tsx`

**位置**：Modal 中的 Form（约第 629 行）

**修改内容**：

```typescript
// 添加状态
const [showVoiceInput, setShowVoiceInput] = useState(false);
const [voiceInputField, setVoiceInputField] = useState<'amount' | 'description' | null>(null);

// 语音识别结果处理
const handleVoiceResult = (text: string) => {
  console.log('语音识别结果:', text);
  
  if (voiceInputField === 'amount') {
    // 解析金额
    const amount = parseExpenseAmount(text);
    if (amount !== null) {
      form.setFieldsValue({ amount });
      message.success(`识别到金额: ¥${amount}`);
    }
  } else if (voiceInputField === 'description') {
    // 直接使用识别文本作为描述
    form.setFieldsValue({ description: text });
  }
  
  // 尝试识别类别
  const category = parseExpenseCategory(text);
  if (category) {
    form.setFieldsValue({ category });
    message.success(`识别到类别: ${EXPENSE_CATEGORIES[category]}`);
  }
  
  setShowVoiceInput(false);
  setVoiceInputField(null);
};

// 解析金额的辅助函数
const parseExpenseAmount = (text: string): number | null => {
  // 匹配各种金额表达方式
  const patterns = [
    /(\d+\.?\d*)元/,
    /(\d+\.?\d*)块/,
    /(\d+\.?\d*)块钱/,
    /花了(\d+\.?\d*)/,
    /(\d+\.?\d*)$/,  // 纯数字
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  
  return null;
};

// 解析类别的辅助函数
const parseExpenseCategory = (text: string): ExpenseCategory | null => {
  const categoryKeywords: Record<ExpenseCategory, string[]> = {
    transportation: ['交通', '出租车', '地铁', '公交', '打车', '滴滴', '车费'],
    accommodation: ['住宿', '酒店', '宾馆', '民宿', '房费'],
    food: ['吃饭', '午餐', '晚餐', '早餐', '餐饮', '饭', '吃'],
    attraction: ['门票', '景点', '参观', '游览'],
    shopping: ['购物', '买', '商场', '超市'],
    other: ['其他'],
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category as ExpenseCategory;
    }
  }
  
  return null;
};

// 修改表单
<Modal
  title="添加费用"
  open={modalVisible}
  onOk={handleAddExpense}
  onCancel={() => {
    setModalVisible(false);
    form.resetFields();
    setShowVoiceInput(false);
  }}
  okText="添加"
  cancelText="取消"
  width={600}
>
  {showVoiceInput ? (
    <VoiceInput
      onResult={handleVoiceResult}
      onCancel={() => {
        setShowVoiceInput(false);
        setVoiceInputField(null);
      }}
    />
  ) : (
    <Form form={form} layout="vertical">
      <Form.Item label="类别" name="category" rules={[{ required: true, message: '请选择类别' }]}>
        <Select placeholder="请选择费用类别">
          {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
            <Option key={key} value={key}>
              <Space>
                {getCategoryIcon(key as ExpenseCategory)}
                {label}
              </Space>
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item label="金额" name="amount" rules={[{ required: true, message: '请输入金额' }]}>
        <Space.Compact style={{ width: '100%' }}>
          <InputNumber
            style={{ flex: 1 }}
            min={0}
            precision={2}
            prefix="¥"
            placeholder="请输入金额"
          />
          <Button
            icon={<AudioOutlined />}
            onClick={() => {
              setShowVoiceInput(true);
              setVoiceInputField('amount');
            }}
            type="primary"
            ghost
          >
            语音输入
          </Button>
        </Space.Compact>
      </Form.Item>
      
      <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述' }]}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            style={{ flex: 1 }}
            placeholder="例如：午餐、出租车费"
          />
          <Button
            icon={<AudioOutlined />}
            onClick={() => {
              setShowVoiceInput(true);
              setVoiceInputField('description');
            }}
            type="primary"
            ghost
          >
            语音
          </Button>
        </Space.Compact>
      </Form.Item>
      
      <Form.Item label="日期" name="date" rules={[{ required: true, message: '请选择日期' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item label="备注" name="notes">
        <Input.TextArea rows={3} placeholder="可选的备注信息" />
      </Form.Item>
      
      {/* 快捷语音输入提示 */}
      <Alert
        message="💡 语音输入提示"
        description={
          <div>
            <p style={{ margin: '4px 0' }}>• 说"午餐花了50块"会自动识别金额和类别</p>
            <p style={{ margin: '4px 0' }}>• 说"出租车费30元"会自动填充</p>
            <p style={{ margin: '4px 0' }}>• 说"门票80"会识别为景点费用</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Form>
  )}
</Modal>
```

#### 📊 测试用例

**测试用例 1：完整语音输入**

**输入语音**："午餐花了50块"

**预期结果**：
- ✅ 金额字段填充：50
- ✅ 类别自动选择：餐饮
- ✅ 描述字段填充："午餐花了50块"

**测试用例 2：仅金额语音输入**

**操作**：
1. 点击金额字段的"语音输入"按钮
2. 说"80元"

**预期结果**：
- ✅ 金额字段填充：80
- ✅ 其他字段不变

#### ⏱️ 工作量估算
- **开发时间**：3-4 小时
- **测试时间**：1 小时
- **总计**：4-5 小时

---

### 功能 4：城际交通信息（航班/高铁）

#### 📌 功能描述
在行程的第一天和最后一天，提供出发地到目的地的航班或高铁信息，包括车次、时刻、票价等。

#### 🎯 需求背景
- **用户痛点**：用户需要自己查询航班/高铁信息
- **需求来源**：项目需求文档 2.1 节 - "交通方案（航班、高铁、市内交通）"
- **优先级**：🟡 中（重要功能）

#### ✅ 验收标准

1. **信息完整性**：
   - ✅ 提供航班号或车次（参考）
   - ✅ 提供出发和到达时间
   - ✅ 提供参考票价
   - ✅ 提供出发和到达机场/车站

2. **UI 显示**：
   - ✅ 在行程卡片中显示城际交通信息
   - ✅ 明确标注为"参考信息"
   - ✅ 提供购票建议

3. **准确性**：
   - ✅ 时间安排合理
   - ✅ 票价接近真实价格
   - ✅ 考虑出发时间（建议提前2小时到机场）

#### 🛠️ 技术实现方案

**步骤 1：增强 AI Prompt**

**文件**：`frontend/src/services/llm.ts`

**位置**：`systemPrompt`（约第 228 行）

**新增内容**：

```typescript
✈️ 城际交通要求（新增）：
- 第一天必须包含从出发地到目的地的交通信息
- 最后一天必须包含从目的地返回出发地的交通信息
- 城际交通信息要求：
  * type: "flight"（飞机）或 "train"（高铁/火车）
  * flight_number 或 train_number: 车次号（参考，如"CA1234"、"G123"）
  * from: 出发机场/车站（如"上海虹桥机场"、"北京南站"）
  * to: 到达机场/车站
  * departure_time: 出发时间（如"08:00"）
  * arrival_time: 到达时间（如"10:30"）
  * duration: 飞行/行驶时间（如"2小时30分钟"）
  * price: 参考票价（数字类型）
  * notes: 注意事项（如"建议提前2小时到达机场"）
- 票价要真实合理：
  * 国内航班：500-2000元
  * 高铁：根据距离，100-1000元
  * 普通火车：根据距离，50-500元
- 时间安排要合理：
  * 飞机：建议早上8点左右出发，下午5点左右返回
  * 高铁：根据距离安排，避免太早或太晚
```

**步骤 2：更新 JSON 示例**

在 `userPrompt` 的 JSON 示例中添加：

```json
"transportation": [
  {
    "type": "flight",
    "from": "上海虹桥机场",
    "to": "北京首都机场",
    "departure_time": "08:00",
    "arrival_time": "10:30",
    "duration": "2小时30分钟",
    "price": 800,
    "flight_number": "CA1234（参考）",
    "notes": "建议提前2小时到达机场办理值机手续"
  }
]
```

**步骤 3：在行程卡片中显示城际交通**

**文件**：`frontend/src/components/ItineraryCard/index.tsx`

**位置**：在卡片底部添加城际交通信息显示

**新增内容**：

```typescript
{/* 城际交通信息 */}
{dayItinerary.transportation && dayItinerary.transportation.length > 0 && (
  <div className="intercity-transport">
    <Divider orientation="left">
      <Space>
        <RocketOutlined />
        <Text strong>城际交通</Text>
      </Space>
    </Divider>
    {dayItinerary.transportation.map((trans, idx) => (
      <Card
        key={idx}
        size="small"
        style={{ marginBottom: 12, background: '#e6f7ff', border: '1px solid #91d5ff' }}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              {trans.type === 'flight' ? <RocketOutlined /> : <TrainOutlined />}
              <Text strong>
                {trans.type === 'flight' ? '航班' : '高铁/火车'}
                {trans.flight_number || trans.train_number ? `: ${trans.flight_number || trans.train_number}` : ''}
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
  </div>
)}
```

#### ⏱️ 工作量估算
- **开发时间**：1-2 小时
- **测试时间**：0.5 小时
- **总计**：1.5-2.5 小时

---

### 功能 5：预算超支提醒

#### 📌 功能描述
当用户添加费用后，实时检查预算使用情况，在预算即将用完或已超支时弹出提醒。

#### 🎯 需求背景
- **用户痛点**：用户可能不知道预算已经超支
- **需求来源**：用户体验优化
- **优先级**：🟡 中（重要功能）

#### ✅ 验收标准

1. **预警机制**：
   - ✅ 预算使用 > 80%：黄色警告
   - ✅ 预算使用 > 90%：橙色警告
   - ✅ 预算超支：红色错误提示

2. **提醒内容**：
   - ✅ 显示当前预算使用百分比
   - ✅ 显示剩余预算金额
   - ✅ 提供预算调整建议

3. **用户体验**：
   - ✅ 提醒不过于频繁
   - ✅ 可关闭提醒
   - ✅ 提供"不再提示"选项

#### 🛠️ 技术实现方案

**文件**：`frontend/src/pages/Budget.tsx`

**位置**：`handleAddExpense` 函数中（约第 160 行）

**修改内容**：

```typescript
// 添加费用
const handleAddExpense = async () => {
  try {
    const values = await form.validateFields();
    await createExpense({
      plan_id: selectedPlanId!,
      category: values.category,
      amount: values.amount,
      currency: 'CNY',
      description: values.description,
      date: values.date.format('YYYY-MM-DD'),
      notes: values.notes || '',
    });

    message.success({
      content: (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 添加成功</div>
          <div>费用记录已保存</div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            金额: ¥{values.amount} | 类别: {EXPENSE_CATEGORIES[values.category]}
          </div>
        </div>
      ),
      duration: 3,
    });
    
    setModalVisible(false);
    form.resetFields();
    await loadExpenses();
    
    // 检查预算使用情况（新增）
    checkBudgetStatus();
    
  } catch (error: any) {
    console.error('添加费用失败:', error);
    message.error({
      content: (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 添加失败</div>
          <div>无法保存费用记录</div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <div>错误原因: {error.message}</div>
          </div>
        </div>
      ),
      duration: 6,
    });
  }
};

// 检查预算状态（新增函数）
const checkBudgetStatus = () => {
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  if (!selectedPlan) return;
  
  const totalBudget = selectedPlan.budget;
  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const usagePercentage = (totalSpent / totalBudget) * 100;
  const remaining = totalBudget - totalSpent;
  
  // 预算超支
  if (totalSpent > totalBudget) {
    Modal.error({
      title: '❌ 预算超支提醒',
      content: (
        <div>
          <p style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4d4f', marginBottom: 12 }}>
            您的旅行预算已超支！
          </p>
          <div style={{ background: '#fff1f0', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <p style={{ margin: '4px 0' }}>
              <strong>总预算：</strong>¥{totalBudget.toFixed(2)}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>已花费：</strong>¥{totalSpent.toFixed(2)}
            </p>
            <p style={{ margin: '4px 0', color: '#ff4d4f' }}>
              <strong>超支金额：</strong>¥{Math.abs(remaining).toFixed(2)}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>预算使用率：</strong>{usagePercentage.toFixed(1)}%
            </p>
          </div>
          <p style={{ fontSize: 14, color: '#666' }}>
            💡 建议：
          </p>
          <ul style={{ fontSize: 14, color: '#666', paddingLeft: 20 }}>
            <li>调整后续行程，减少非必要开支</li>
            <li>选择更经济的交通和住宿方式</li>
            <li>考虑增加旅行预算</li>
          </ul>
        </div>
      ),
      okText: '我知道了',
      width: 500,
    });
  }
  // 预算即将用完（90%）
  else if (usagePercentage >= 90) {
    Modal.warning({
      title: '⚠️ 预算预警',
      content: (
        <div>
          <p style={{ fontSize: 16, fontWeight: 'bold', color: '#faad14', marginBottom: 12 }}>
            您的预算即将用完！
          </p>
          <div style={{ background: '#fffbe6', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <p style={{ margin: '4px 0' }}>
              <strong>总预算：</strong>¥{totalBudget.toFixed(2)}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>已花费：</strong>¥{totalSpent.toFixed(2)}
            </p>
            <p style={{ margin: '4px 0', color: '#faad14' }}>
              <strong>剩余预算：</strong>¥{remaining.toFixed(2)}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>预算使用率：</strong>{usagePercentage.toFixed(1)}%
            </p>
          </div>
          <p style={{ fontSize: 14, color: '#666' }}>
            💡 建议：请注意控制后续支出，避免预算超支
          </p>
        </div>
      ),
      okText: '我知道了',
      width: 500,
    });
  }
  // 预算使用超过80%
  else if (usagePercentage >= 80) {
    message.warning({
      content: (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 预算提醒</div>
          <div>您已使用 {usagePercentage.toFixed(1)}% 的预算</div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            剩余预算: ¥{remaining.toFixed(2)}
          </div>
        </div>
      ),
      duration: 5,
    });
  }
};
```

#### ⏱️ 工作量估算
- **开发时间**：1-2 小时
- **测试时间**：0.5 小时
- **总计**：1.5-2.5 小时

---

## 🟢 低优先级功能

### 功能 6：景点图片展示

#### 📌 功能描述
在行程卡片中显示景点的真实图片，提升视觉效果和用户体验。

#### 🎯 需求背景
- **用户痛点**：纯文字行程不够直观
- **需求来源**：UI/UX 优化
- **优先级**：🟢 低（优化项）

#### ✅ 验收标准

1. **图片来源**：
   - ✅ 使用高德地图 POI 图片
   - ✅ 或使用 AI 返回的图片 URL
   - ✅ 有默认占位图

2. **显示效果**：
   - ✅ 图片尺寸合适
   - ✅ 加载失败有占位图
   - ✅ 支持点击放大

#### ⏱️ 工作量估算
- **开发时间**：4-6 小时
- **测试时间**：1 小时
- **总计**：5-7 小时

---

### 功能 7：离线缓存

#### 📌 功能描述
使用 Service Worker 和 IndexedDB 实现离线缓存，用户可以在无网络时查看已保存的行程。

#### 🎯 需求背景
- **用户痛点**：旅行中可能没有网络
- **需求来源**：项目需求文档 2.3 节 - "离线数据缓存"
- **优先级**：🟢 低（优化项）

#### ⏱️ 工作量估算
- **开发时间**：6-8 小时
- **测试时间**：2 小时
- **总计**：8-10 小时

---

### 功能 8：行程分享功能

#### 📌 功能描述
用户可以将行程分享给他人，或导出为 PDF。

#### 🎯 需求背景
- **用户痛点**：无法分享行程给同行人
- **需求来源**：用户体验优化
- **优先级**：🟢 低（优化项）

#### ⏱️ 工作量估算
- **开发时间**：4-6 小时
- **测试时间**：1 小时
- **总计**：5-7 小时

---

## 📅 开发计划建议

### 第一阶段：核心功能完善（必须完成）

**目标**：满足项目需求文档的核心要求

**任务清单**：
1. ✅ 景点间交通规划（3-4 小时）
2. ✅ 真实路线规划（6-8 小时）

**总工作量**：9-12 小时（约 1.5-2 个工作日）

**验收标准**：
- ✅ AI 生成的行程包含景点间交通信息
- ✅ 地图显示真实的道路路线
- ✅ 时间和距离估算准确

---

### 第二阶段：重要功能补充（建议完成）

**目标**：提升用户体验，满足需求文档的所有要求

**任务清单**：
1. ✅ 费用语音录入（4-5 小时）
2. ✅ 城际交通信息（1.5-2.5 小时）
3. ✅ 预算超支提醒（1.5-2.5 小时）

**总工作量**：7-10 小时（约 1-1.5 个工作日）

**验收标准**：
- ✅ 费用管理页面支持语音输入
- ✅ 行程包含航班/高铁信息
- ✅ 预算超支时有明确提醒

---

### 第三阶段：体验优化（可选）

**目标**：进一步提升产品竞争力

**任务清单**：
1. ✅ 景点图片展示（5-7 小时）
2. ✅ 离线缓存（8-10 小时）
3. ✅ 行程分享功能（5-7 小时）

**总工作量**：18-24 小时（约 2.5-3 个工作日）

---

## 📊 总工作量估算

| 阶段 | 工作量 | 优先级 | 状态 |
|------|--------|--------|------|
| 第一阶段 | 9-12 小时 | 🔴 高 | ⏳ 待开始 |
| 第二阶段 | 7-10 小时 | 🟡 中 | ⏳ 待开始 |
| 第三阶段 | 18-24 小时 | 🟢 低 | ⏳ 待开始 |
| **总计** | **34-46 小时** | | **约 4.5-6 个工作日** |

---

## ✅ 下一步行动

**建议优先完成第一阶段的功能**：

1. **景点间交通规划**（3-4 小时）
   - 修改 AI Prompt
   - 更新 JSON 示例
   - 修改行程卡片显示
   - 测试验证

2. **真实路线规划**（6-8 小时）
   - 集成高德地图路线规划 API
   - 实现驾车/步行/公交路线
   - 添加交通方式切换
   - 显示详细路线步骤
   - 测试验证

**完成第一阶段后，项目完成度将达到 85%，基本满足需求文档的核心要求。**

---

**是否需要我开始实现这些功能？请告诉我从哪个功能开始！** 🚀

