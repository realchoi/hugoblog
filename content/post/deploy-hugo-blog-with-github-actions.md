---
title: "使用 Github Actions 自动部署 hugo 博客"
slug: "deploy-hugo-blog-with-github-actions"
tags: [hugo, Github Actions]
categories: [技术]
date: 2023-12-17T13:03:07+08:00
lastmod: 2023-12-17T13:03:07+08:00
draft: false
---

 hugo 博客系统，大部分人应该都在使用，但是部署的方式，也不相同。Github Actions 这么好用的工具已经出来好几年了，但是一直都没尝试过。本次就简单记录一下使用 Github Actions 自动部署 hugo 博客的方法。



### 两个仓库

如果想使用 Github Actions 自动部署 hugo 博客，则最起码需要创建两个 Github 的仓库。

> 1. 第一个，便是存储博客 .md 源文件的地方，其实就是 hugo 系统；
> 2. 第二个，则是部署 github pages 的仓库，仓库名必须是 `<username>.github.io`，这是 github 官方要求的。



### 具体流程

当我们提交博客 .md 源文件到仓库 1 后，利用 github actions 自动执行 hugo 的命令，将 .md  源文件生成为 html 文件，放在 `public` 目录下，然后再将 `public` 目录推送到仓库 2；由于仓库 2 是 github pages，它接着就会自动执行部署的命令。

这样，我们的博客网站就部署好了，这极大地简化了我们发布文章的流程。
