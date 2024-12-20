---
title: "git 如何忽略已经添加和提交的文件？"
slug: "how-to-ignore-files-added-and-commited-in-git"
tags: [git, GitHub, gitlab]
categories: [技术]
keywords:
- git
- github
- gitlab
- 教程
- tutorial
description: "提交完 git 仓库后，发现没有创建 `.gitignore` 文件，导致将所有文件都推送到了仓库，此时想要再通过创建 `.gitignore` 文件来忽略，会发现并不会直接生效。"
summary: "提交完 git 仓库后，发现没有创建 `.gitignore` 文件，导致将所有文件都推送到了仓库，此时想要再通过创建 `.gitignore` 文件来忽略，会发现并不会直接生效。"
date: 2024-12-20T14:48:59+08:00
lastmod: 2024-12-20T14:48:59+08:00
draft: false 
---

### 背景

如果在初始化 git 仓库时，没有创建 `.gitignore` 文件来过滤不需要提交的内容，而是将所有文件都推送到了仓库，后来却发现某些内容无需提交，此时想要再通过创建 `.gitignore` 文件来忽略，会发现并不会直接生效。

事实上， `.gitignore` 只会对那些还没有被跟踪（track）的文件/文件夹生效，上面的情景，所有文件/文件夹已经被跟踪了，所以后来创建的忽略规则，不会对他们生效。



### 解决

要解决这个问题，需要以下步骤：

**首先**，先将文件从 git 的追踪列表中移除，但**保留文件**：

```bash
# 将所有已追踪的文件从 git 缓存中移除
git rm -r --cached .

# 重新添加所有文件(此时会应用新的 .gitignore 规则)  
git add .
```

**接下来**，提交更改：

```bash
git commit -m "chore: 应用 .gitignore 规则，移除不需要追踪的文件"
```

**最后**，推送到远程仓库：

```bash
git push
```

这样做的效果是：

- 已被追踪的忽略文件会从 git 仓库中移除；
- 本地文件会保持不变；
- 新的 .gitignore 规则会立即生效；
- 其他开发者在拉取代码后,这些被忽略的文件也不会再被追踪。

需要注意：

- 这个操作会修改 git 历史；
- 如果团队协作开发，建议和其他开发者沟通后再操作；
- 操作前最好先备份重要文件。