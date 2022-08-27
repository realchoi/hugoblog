---
title: 利用 Cloudflare 进行免费的域名转发
slug: "cloudflare-for-free-domain-forwarding"
date: 2017-11-29
tags: 
  - 域名
  - Cloudflare
categories: [技术, 工作]
draft: false
---

## 前言

人人都能接触互联网的时代，估计你手上也有闲置的域名，为了不浪费，可以用来干一些其他的小事情，比如将自己的域名跳转到微博或者 QQ 空间等等。这里我们利用免费并且强大的 Cloudflare 来完成。

## 方法

* 打开 Cloudflare 官网 <https://www.cloudflare.com>，注册、登录、添加自己的域名，并且在自己的域名提供商页面，将域名的 NameServer 更改为 Cloudflare 提供的 NameServer 。这里不需要赘述。
* 点击 DNS 按钮，添加 DNS Records 。比如添加一个 A 记录，指向谷歌提供的的 IPv4地址 8.8.8.8 。
  ![](https://i.loli.net/2017/11/29/5a1ea5c9614ea.png)
* 点击上一步中 DNS 按钮右侧的 Page Rules 按钮来添加规则。点击 Create Page Rule ，然后在弹出的页面上，第一行填写自己的域名，格式如 example.com/* ，点击下方 Add a Setting 按钮，选择 Forwarding URL ，右侧选择 301 重定向，最后一栏填写自己想要跳转的页面地址，比如自己的微博地址。最后保存并部署。
  ![](https://i.loli.net/2017/11/29/5a1ea891350e1.png)
* 过几分钟大概就会生效了，可以访问一下自己的域名试试看。