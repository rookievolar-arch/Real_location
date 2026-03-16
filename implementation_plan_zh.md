# 北京时间及位置定位安卓应用实施计划

该应用将提供实时的北京时间、GPS 经纬度以及中文逆地理编码（城市/地区）。应用将采用高性能的 Web 技术构建，并使用 Capacitor 封装为安卓 APK。

## 待用户确认事项
- **关于逆地理编码**：为了获取精确的中文城市和地区名称，通常需要地图服务（如高德或百度）的 API Key。初版我将尝试使用公开免费接口，但可能在精度或稳定性上有所限制。

## 计划变更内容

### [Web 应用部分]
应用将使用 Vite、React 和原生 CSS 构建，确保视觉精美且运行流畅。**整体主题色调为白色**，采用简洁、高端的现代设计。

#### [新建] [index.html](file:///d:/antigarvity_project/app_for_stu.zhang/index.html)
应用的入口文件。

#### [新建] [src/App.jsx](file:///d:/antigarvity_project/app_for_stu.zhang/src/App.jsx)
核心逻辑，包括时间更新、地理位置获取及退出确认对话框。

#### [新建] [src/index.css](file:///d:/antigarvity_project/app_for_stu.zhang/src/index.css)
高级样式设计，包含磨砂玻璃效果（Glassmorphism）、渐变背景及响应式布局。

#### [新建] [src/components/Clock.jsx](file:///d:/antigarvity_project/app_for_stu.zhang/src/components/Clock.jsx)
显示实时北京时间的组件（精确到秒）。

#### [新建] [src/components/LocationInfo.jsx](file:///d:/antigarvity_project/app_for_stu.zhang/src/components/LocationInfo.jsx)
显示经纬度及中文位置信息的组件。

#### [新建] [src/components/ExitDialog.jsx](file:///d:/antigarvity_project/app_for_stu.zhang/src/components/ExitDialog.jsx)
退出软件时的确认窗口。

### [安卓平台配置]
#### [新建] [capacitor.config.ts](file:///d:/antigarvity_project/app_for_stu.zhang/capacitor.config.ts)
Capacitor 配置文件，用于启用安卓打包。

## 验证计划

### 自动化/浏览器验证
- 运行 `npm run dev` 并在浏览器中验证：
    - 时间每秒更新一次。
    - 经纬度能够成功获取（或在模拟定位下正常显示）。
    - 退出确认弹窗在触发时能正常显示。

### 手动验证
- 检查不同屏幕尺寸下的 UI 布局适配。
- 对比权威时间源，确认北京时间的准确性。
- 确认显示的中文城市和地区名称与实际位置一致。
