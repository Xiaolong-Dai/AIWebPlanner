#!/bin/bash

# AI Web Planner - 清除缓存并重启开发服务器

echo "🧹 清除 Vite 缓存..."
rm -rf node_modules/.vite

echo "🧹 清除 TypeScript 缓存..."
rm -rf node_modules/.cache

echo "🔄 重启开发服务器..."
npm run dev

