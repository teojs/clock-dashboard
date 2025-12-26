# Clock Dashboard | 天气时钟看板

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/vue-3.4-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/vite-5.0-blueviolet.svg)](https://vitejs.dev/)
[![releases](https://img.shields.io/github/v/release/teojs/clock-dashboard?color=green&label=releases)](https://github.com/teojs/clock-dashboard/releases)

一个基于 Vue 3 + TypeScript + Vite + Tailwind CSS 构建的天气时钟看板。
将闲置旧 iPad 变为时钟看板，支持天气、农历、日历、Home Assistant 智能设备控制（通过左右滑动切换页面）。

预览地址：[https://teojs.github.io/clock-dashboard/](https://teojs.github.io/clock-dashboard/)

---

## 更新日志

- 2025-12-26 （[v1.10.0](https://github.com/teojs/clock-dashboard/releases/tag/v1.10.0)）
  - 新增天气设置弹窗，支持设置天气刷新间隔、下雨、下雪、打雷特效开关。

---

## 🌟 特性

- **动态数字时钟**：支持滚动动画和随机倾斜效果，模拟手写/艺术字感，点击可切换秒数显示。
- **实时天气**：基于[Open-Meteo](https://open-meteo.com/)，根据地理位置或 IP 自动获取天气、温度、湿度。

  天气右边3个指标是：湿度、体感温度、紫外线指数。

  点击底部天气区域可以进行设置。

- **农历信息**：集成 `lunar-typescript`，提供精准的农历、干支年及节日显示。
- **全屏日历**：内置万年历视图，支持月份切换及今天快速跳转。
- **智能家居控制**：深度集成 Home Assistant，支持灯光、开关、窗帘电机（Cover）等设备的实时控制与状态同步。
- **PWA 支持**：支持 iOS "添加到主屏幕"，全屏沉浸式体验，无地址栏。
- **JSON 配置**：智能设备支持一键 JSON 导入/导出，方便跨设备同步配置。

## 📸 预览

### 1. 时钟页面

![时钟页面](./docs/1.png)

### 2. 智能家居控制

![智能控制](./docs/0.png)

### 3. 全屏日历

![日历视图](./docs/2.png)

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/clock-dashboard.git
cd clock-dashboard
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 本地开发

```bash
pnpm dev
```

服务将运行在 `http://localhost:3000`。

### 4. 生产打包

```bash
pnpm build
```

打包产物将生成在 `dist` 目录中。

---

## ⚙️ Home Assistant 智能家居配置

在应用中点击右上角设置图标，可以配置您的 Home Assistant 信息：

1. **HA 地址**：例如 `http://192.168.1.100:8123`
2. **长期访问令牌**：在 HA 个人设置页底部生成。
3. **跨域配置 (CORS)**：为了让看板能够正常访问 HA 接口，您需要修改 HA 的 `configuration.yaml`，添加以下内容并重启 HA：

```yaml
http:
  cors_allowed_origins:
    - https://your-github-username.github.io # 如果使用 GitHub Pages 部署
    - http://192.168.1.xxx:3000 # 本地开发地址
```

4. **JSON 模式**：您可以直接粘贴以下格式进行批量配置：

```json
{
  "url": "http://your-ha-url:8123",
  "token": "your-long-lived-access-token",
  "entities": [
    { "id": "light.living_room", "name": "客厅灯" },
    { "id": "cover.bedroom_curtain", "name": "卧室窗帘" }
  ]
}
```

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议。
