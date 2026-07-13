---
title: "zoxide 常用命令总结"
slug: "zoxide-common-commands"
date: 2026-07-13T11:41:56+08:00
lastmod: 2026-07-13T11:41:56+08:00
description: "整理 zoxide 的常用目录跳转、查询、权重调整、记录清理、Shell 初始化和环境变量配置命令。"
summary: "一篇 zoxide 常用命令速查笔记，涵盖智能跳转、交互式查询、权重调整、记录清理与 Shell 配置。"
cover:
  image: "/covers/zoxide-common-commands.svg"
  alt: "zoxide 常用命令总结封面"
  relative: false
tags: [zoxide, Shell, zsh, macOS, 命令行]
categories: [开发工具, 效率工具]
keywords:
  - zoxide 常用命令
  - zoxide 使用教程
  - zoxide query
  - zoxide zsh
  - 终端目录跳转
draft: false
---

在 macOS 终端中，`z` 通常是一个非常强大的快速目录跳转命令，需要通过安装 Oh My Zsh 的 `z` 插件或 `zoxide` 来使用。它会记住你经常访问的文件夹，让你不用输入完整路径就能瞬间到达。

本文主要整理 `zoxide` 的常用命令。

<!-- more -->

## 一、日常目录跳转

### `z 关键词`

跳转到匹配度和使用频率最高的目录：

```bash
z Picser
z Downloads
z projects frontend
```

多个关键词会按照出现顺序匹配路径：

```bash
z macos Picser
```

### `z 路径`

像普通 `cd` 一样直接进入目录，同时让 `zoxide` 学习该路径：

```bash
z ~/Downloads
z ../Picser-Site
```

### `z -`

返回上一次所在目录，作用类似：

```bash
cd -
```

### `z ..`

进入上级目录，作用类似：

```bash
cd ..
```

### `zi 关键词`

交互式选择匹配目录，通常需要安装 `fzf`：

```bash
zi Picser
zi project
```

当多个目录名称接近时特别有用，例如：

```text
~/05.macos/Picser
~/05.macos/Picser/Picser-App
~/05.macos/Picser/Picser-Site
```

## 二、查询数据库

### 查看最终会匹配哪个目录

```bash
zoxide query Picser
```

只输出最佳匹配：

```text
/Users/eric/01.HelloWord/05.macos/Picser
```

### 列出所有匹配目录

```bash
zoxide query -l Picser
```

### 同时显示目录分数

```bash
zoxide query -ls Picser
```

例如：

```text
1108.0 /Users/eric/01.HelloWord/05.macos/Picser
140.0 /Users/eric/01.HelloWord/05.macos/Picser/Picser-App
```

分数越高，越容易成为 `z Picser` 的跳转目标。

### 显示已失效的目录记录

```bash
zoxide query -a Picser
```

`-a` 会包含数据库中存在、但文件系统中已经不存在的路径。

### 列出全部记录，包括失效路径和分数

```bash
zoxide query -als
```

### 交互式查询

```bash
zoxide query -i Picser
```

一般直接使用更短的命令：

```bash
zi Picser
```

### 限制查询范围

```bash
zoxide query --base-dir ~/01.HelloWord Picser
```

只查找该目录下的匹配路径。

### 排除某个目录

```bash
zoxide query --exclude ~/01.HelloWord/05.macos/Picser Picser
```

## 三、添加和提高目录权重

### 手动添加目录

```bash
zoxide add ~/Projects/MyApp
```

如果记录已经存在，会提高它的分数。

### 指定增加的分数

```bash
zoxide add -s 100 ~/Projects/MyApp
```

想让某个目录优先匹配，可以给予更高权重：

```bash
zoxide add -s 1000 ~/01.HelloWord/05.macos/Picser
```

然后检查：

```bash
zoxide query -ls Picser
```

## 四、删除目录记录

### 删除指定记录

```bash
zoxide remove ~/Projects/OldProject
```

这只会删除 `zoxide` 数据库记录，不会删除真实目录。

例如，移除干扰匹配的子目录：

```bash
zoxide remove ~/01.HelloWord/05.macos/Picser/Picser-App
```

### 删除多个记录

```bash
zoxide remove ~/Projects/OldApp ~/Projects/OldSite
```

### 清理已不存在的目录

先查看失效记录：

```bash
zoxide query -als
```

再逐个删除：

```bash
zoxide remove "/完整的失效目录路径"
```

## 五、直接编辑数据库

```bash
zoxide edit
```

这会使用系统配置的编辑器打开 `zoxide` 数据库记录，适合批量调整或删除记录。

可以通过 `EDITOR` 指定编辑器：

```bash
EDITOR=vim zoxide edit
```

或者：

```bash
EDITOR=nano zoxide edit
```

通常优先使用 `zoxide add` 和 `zoxide remove`，直接编辑数据库主要用于批量维护。

## 六、Shell 初始化

### zsh

在 `~/.zshrc` 中加入：

```bash
eval "$(zoxide init zsh)"
```

修改后重新加载：

```bash
source ~/.zshrc
```

### bash

在 `~/.bashrc` 中加入：

```bash
eval "$(zoxide init bash)"
```

### fish

在 Fish 配置中加入：

```fish
zoxide init fish | source
```

### 使用 `cd` 替代 `z`

如果想让 `zoxide` 直接接管 `cd`：

```bash
eval "$(zoxide init zsh --cmd cd)"
```

不过这会改变原有 `cd` 行为。一般建议保留默认的 `z`，更容易区分普通跳转和智能跳转。

## 七、常用环境变量

### 跳转前显示目标路径

```bash
export _ZO_ECHO=1
```

加入 `~/.zshrc` 后，执行 `z Picser` 时会先显示最终匹配的目录。

### 排除不希望记录的目录

```bash
export _ZO_EXCLUDE_DIRS="$HOME/Library/*:$HOME/.Trash/*"
```

多个规则使用冒号分隔。修改后执行：

```bash
source ~/.zshrc
```

### 指定数据库目录

```bash
export _ZO_DATA_DIR="$HOME/.local/share/zoxide"
```

除非需要同步或迁移数据库，否则通常不需要修改。

## 八、常用命令速查

```bash
z keyword                 # 智能跳转
zi keyword                # 交互式选择
zoxide query keyword      # 查看最终匹配
zoxide query -ls keyword  # 查看所有候选及分数
zoxide add -s 1000 PATH   # 添加或提高权重
zoxide remove PATH        # 删除数据库记录
zoxide edit               # 直接编辑数据库
```
