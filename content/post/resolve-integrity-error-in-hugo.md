---
title: "解决 hugo 中关于 integrity 的错误"
slug: "resolve-integrity-error-in-hugo"
date: 2022-08-26T00:04:05+08:00
lastmod: 2022-08-27T10:34:05+08:00
tags: [Hugo, 博客, PaperMod]
categories: [技术]
keywords:
- hugo
- 博客
- 报错
- integrity
- 教程
- tutorial
description: "解决 hugo 博客报错：Failed to find a valid digest in the 'integrity' attribute for resource "xxx.css", The resource has been blocked."
summary: "解决 hugo 博客报错：Failed to find a valid digest in the 'integrity' attribute for resource "xxx.css", The resource has been blocked."
draft: false
---

## 错误描述

在 Github Pages 上部署 Hugo 博客后，网站样式丢失，打开浏览器 F12 控制台可以发现错误：`Failed to find a valid digest in the 'integrity' attribute for resource "xxx.css", The resource has been blocked.`。

## 解决办法

我用的是 `PaperMod` 主题，不知道是不是主题自身的原因，在网上搜了一大圈后，也没找到该主题官方对该错误的说明。但是有一点可以确定的是，页面上的 `integrity` 属性出了问题，至于这个属性是什么意思，我也不懂。

### 修改每个首页 html 文件

有人给出的解决办法是将网站中代表每个模块首页的 `index.html` 文件里面的 `integrity` 属性的值置空，我试着将网站首页的 `index.html` 文件改了一下，确实可以解决问题。但这么多 `index.html` 文件，一个个手改，工作量太大，也会容易遗漏。另外，即便这次改好了，后面再次重新发布文章的时候，就又会将其覆盖，所以这个方法并不可行。

### 修改基类 html 文件

后面倒是在 [Satckoverflow](https://stackoverflow.com/questions/65040931/hugo-failed-to-find-a-valid-digest-in-the-integrity-attribute-for-resource "Stackoverflow") 上发现了一个类似的问题。下面有人回复说是需要将 `assets` 文件夹下的 `head.html` 中的 `integrity` 的值置空，就可以一劳永逸了，以后每次发布文章也不用担心被覆盖。可是按照他的路径我并没找到该文件，经过一番试错，最后在 `themes\PaperMod\layouts\partials` 文件夹下找到一个 `head.html` 文件，发现里面确实有 `integrity="{{ $stylesheet.Data.Integrity }}"` 这么一句代码，把它改为 `integrity=""` 然后重新发布，发现效果杠杠的~

咱也不懂前端，就先这么照葫芦画瓢解决一下，后面有问题再说。