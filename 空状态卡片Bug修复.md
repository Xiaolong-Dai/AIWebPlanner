# 空状态卡片 Bug 修复报告

## 🐛 问题描述

在优化 PlanCreate 页面布局时，为空状态卡片设置了一个计算高度：

```tsx
<Card
  style={{
    height: 'calc(580px - 380px - 16px - 57px)',  // = 127px
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
```

**问题**:
- 计算结果为 `127px`，高度太小
- 计算逻辑有误：试图让空状态卡片填充剩余空间，但实际上这个计算没有意义
- 导致空状态卡片显示异常

---

## ✅ 修复方案

### 移除不必要的高度计算

**修复前**:
```tsx
<Card
  className="custom-card"
  style={{
    height: 'calc(580px - 380px - 16px - 57px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <div className="empty-state">...</div>
</Card>
```

**修复后**:
```tsx
<Card className="custom-card">
  <div className="empty-state">...</div>
</Card>
```

**原因**:
1. 空状态卡片不需要固定高度
2. 使用全局的 `.empty-state` 样式类已经提供了合适的内边距和布局
3. 让卡片根据内容自适应高度更合理

---

## 📊 效果对比

### 修复前 ❌
- 空状态卡片高度：127px（太小）
- 内容可能被压缩或溢出
- 视觉效果不佳

### 修复后 ✅
- 空状态卡片高度：自适应内容
- 内容正常显示
- 视觉效果良好

---

## 🎯 总结

本次修复移除了不必要的高度计算，让空状态卡片根据内容自适应高度，解决了显示异常的问题。

**修改文件**: `frontend/src/pages/PlanCreate.tsx` (第 262-275 行)

现在页面应该正常显示了！✅

