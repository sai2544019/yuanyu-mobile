# 缘遇（Yuanyu）— 移动端应用

> 温暖连接，遇见有趣灵魂。一款基于兴趣社群的陌生人社交应用。

## 项目概述

缘遇是一款面向年轻都市人群的移动社交应用，核心功能包括滑动匹配、即时聊天、兴趣社群三大模块。项目分为前后端分离架构，本仓库为移动端 Web 应用。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19 |
| 构建工具 | Vite |
| 语言 | TypeScript |
| 路由 | React Router v7 |
| 状态管理 | Zustand |
| HTTP 客户端 | Axios |
| 样式 | CSS Variables + 内联样式 |

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录/注册 | 昵称一键注册或登录 |
| `/onboarding` | 完善资料 | 新用户引导设置头像、性别等 |
| `/` | 首页 | 底部 Tab 导航（发现/消息/我的） |
| `/discover` | 发现页 | 滑动卡片匹配 |
| `/messages` | 消息列表 | 匹配用户和社群消息入口 |
| `/chat/:id` | 聊天页 | 与匹配用户的即时聊天 |
| `/profile` | 我的资料 | 个人资料展示与编辑 |
| `/communities` | 社群列表 | 浏览和加入兴趣社群 |
| `/communities/:id` | 社群详情 | 成员、活动等信息 |

## 功能模块

### 发现页（滑动匹配）

- 左右滑动卡片选择用户
- 心形按钮表示喜欢
- 匹配成功后弹出提示并进入聊天

### 即时聊天

- 消息气泡展示
- 支持文本消息发送
- 消息发送后自动标记已读

### 兴趣社群

- 按分类/城市浏览社群
- 加入/退出社群
- 参与社群活动

### 个人资料

- 头像、昵称、简介编辑
- 兴趣标签管理
- 真心话（问答）展示

## 项目结构

```
src/
├── api/
│   └── client.ts       # Axios 实例 & 拦截器（Token 自动注入、刷新）
├── pages/              # 页面组件
│   ├── LoginPage.tsx           # 登录/注册
│   ├── OnboardingPage.tsx       # 新用户引导
│   ├── MainLayout.tsx           # Tab 导航布局
│   ├── DiscoverPage.tsx         # 发现页（滑动卡片）
│   ├── MessagesPage.tsx         # 消息列表
│   ├── ChatPage.tsx             # 聊天页
│   ├── ProfilePage.tsx          # 个人资料
│   ├── CommunitiesPage.tsx      # 社群列表
│   ├── CommunityDetailPage.tsx   # 社群详情
│   └── UserDetailPage.tsx       # 他人资料详情
├── store/
│   └── index.ts        # Zustand 状态管理（认证、匹配、聊天）
├── styles/
│   └── global.css      # 全局样式（CSS 变量、通用类）
├── types/
│   └── index.ts        # TypeScript 类型定义
├── App.tsx             # 路由配置
└── main.tsx            # 入口
```

## CSS 变量

```css
--primary:      #FF6B6B   /* 品牌色：珊瑚红 */
--secondary:    #4ECDC4   /* 辅助色：青绿 */
--background:   #FAFAFA   /* 背景色 */
--surface:      #FFFFFF   /* 卡片/浮层背景 */
--text:         #333333   /* 主文字 */
--text-sub:     #888888   /* 次要文字 */
--text-light:   #AAAAAA   /* 弱文字 */
--error:        #FF4757   /* 错误提示 */
--success:      #2ED573   /* 成功提示 */
--border:       #EEEEEE   /* 边框 */
--shadow:       0 2px 8px rgba(0,0,0,0.08)  /* 卡片阴影 */
```

## 与后端联调

开发环境 Vite 已配置代理，将 `/api` 请求转发到 `http://localhost:3000`。

```
前端: http://localhost:8081
后端: http://localhost:3000
```

## License

ISC
