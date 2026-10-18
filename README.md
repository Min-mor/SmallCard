# SmallCard — 基于数字名片交互的社会网络构建与关系发掘研究

「被告五人队」课程项目源码：一个基于 **uni-app（Vue 3）** 的微信小程序。以「数字名片」承载个人资料与社交关系，通过名片交换、动态发布、点赞互动、好友关系网络与月度报告等功能，构建并发掘用户的社会网络。

## 技术栈

- 前端框架：uni-app（Vue 3）+ 微信小程序（mp-weixin）
- 构建：Vite + uni-cli
- 数据：MySQL（建表脚本见 `SmallCard/create_tables.sql`、`create_tables_clean.sql`）

## 目录结构

- `SmallCard/` — 小程序项目
  - `pages/` — 页面：首页、名片详情、名片夹、好友、社交动态、月度报告、设置等
  - `static/` — 图片、图标等静态资源
  - `utils/` — 数据库配置与连接封装（`config.js`、`db.js`）、用户服务
  - `create_tables.sql` / `create_tables_clean.sql` — MySQL 建表脚本
  - `manifest.json`、`pages.json`、`project.config.json` — uni-app 与小程序配置
  - `unpackage/` — 微信小程序构建产物
  - `node_modules/` — 依赖（本仓库为完整备份，已包含）

## 本地运行

1. 使用 HBuilderX 或 uni-app CLI 打开 `SmallCard` 目录
2. 安装依赖（仓库已含 `node_modules`，可跳过）：`npm install`
3. 开发调试：`npm run dev:mp-weixin`，然后用微信开发者工具导入 `SmallCard/unpackage/dist/dev/mp-weixin`
4. 数据库：在 MySQL 中导入 `SmallCard/create_tables.sql`（默认库名 `mini_program_digital_card`）

## 说明

- 数据库连接配置位于 `SmallCard/utils/config.js`，仓库中是本地演示用的默认值（localhost / root / 123456），请按自己的环境修改。
- 本仓库为课程项目完整备份，包含构建产物与依赖目录。
