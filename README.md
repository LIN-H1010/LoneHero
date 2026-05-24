# 🗡️ 孤胆英雄 (Lone Hero)

> **把你的自律生活变成一场硬核 RPG 游戏！**

`孤胆英雄` 是一款基于 **React Native** 和 **Expo** 框架开发的“游戏化”待办事项（To-Do List）与习惯养成 App。在这里，你不再是被死板的清单驱使的社畜，而是一名不断接取悬赏、打怪升级的绝世英雄。

---

## ✨ 核心玩法 (Features)

*   📝 **悬赏任务 (Quest Board)**: 像接取 RPG 悬赏任务一样记录你的日常待办。
*   ⚔️ **打怪升级 (Level Up)**: 每完成一项现实生活中的任务，即可获得经验值（EXP）和金币。经验值累积可提升英雄等级，获得极大的成就感。
*   🛡️ **装备商店 (Armory)**: 现实里的自律能变现！使用赚取来的金币在商店中购买强大的武器和拉风的防具。
*   🎒 **行囊系统 (Inventory)**: 查看你的战利品，自由穿脱购买来的神装，打造你的专属战神。
*   🎨 **赛博朋克风 (Cyberpunk Aesthetic)**: 采用极具现代感的暗黑 UI 风格与霓虹配色，体验沉浸式的硬核冒险。

## 🚀 技术栈 (Tech Stack)

*   **框架**: [React Native](https://reactnative.dev/)
*   **工具链**: [Expo SDK 54](https://expo.dev/) (配合 Expo Router 实现丝滑导航)
*   **前端语言**: TypeScript + React
*   **本地存储**: AsyncStorage (数据完全保存在本地，保护隐私无断网焦虑)

## 🛠️ 如何在本地运行 (How to Run)

如果你想把这个项目克隆到本地进行开发或二次修改，请按照以下步骤操作：

1. **安装依赖**
   请确保你的电脑上安装了 [Node.js](https://nodejs.org/)。然后在项目根目录下运行：
   ```bash
   npm install
   ```

2. **启动本地开发服务器**
   ```bash
   npx expo start
   ```

3. **在手机上预览**
   * 下载 **Expo Go** App (iOS / Android)。
   * 手机与电脑连入同一个局域网 (Wi-Fi)，扫描终端中出现的二维码即可直接游玩！

## 📦 如何打包安装包 (Build Standalone App)

本项目已完美配置云端自动化打包，甚至支持为 **越狱 iPhone** 生成原生免签 `.ipa`！

*   **Android (APK)**:
    在本地运行 `npx eas-cli build -p android --profile preview` 即可打出安卓安装包。
*   **iOS (越狱设备专属 IPA)**:
    只需将代码 Push 到本 GitHub 仓库，内置的 [GitHub Actions Workflow](.github/workflows/build-ios.yml) 就会自动在一台免费的云端 Mac 服务器上为您编译出 `.ipa`，请在 Action 运行完毕后在底部的 `Artifacts` 中下载。

---
*“你的每一次自律，都是对平庸挥出的一记重剑。”*
