---
title: "如何给 github 设置代理？"
slug: "how-to-setup-proxy-for-github"
tags: [git, GitHub]
categories: [技术]
keywords:
- git
- github
- 代理
- proxy
- 教程
- tutorial
description: "给 github 设置代理，以获得畅快的网络访问速度！"
summary: "给 github 设置代理，以获得畅快的网络访问速度！"
date: 2024-12-19T10:07:40+08:00
lastmod: 2024-12-19T10:07:40+08:00
draft: false
---

### 背景

我们的电脑上，有时候需要连接多个 git 仓库，比如需要连接公司内部的 GitLab，以及连接自己使用的 GitHub。但是 GitHub 在国内访问速度比较慢，这时候需要单独给 GitHub 设置代理。



### 操作步骤

**首先**，需要查看本机的代理 app 所使用的端口号是多少，Windows 10 上面的具体方法：

依次打开：控制面板 - 网络和 Internet - Internet 选项 - 切换到`连接`选项卡 - 局域网设置，就能看到具体的地址了。

![](https://s3.bmp.ovh/imgs/2024/12/19/98c01f3853e66a92.png)

**其次**，使用命令行设置代理地址：

- 全局设置（不推荐）

  ```bash
  #使用 http 代理 
  git config --global http.proxy http://127.0.0.1:7890
  git config --global https.proxy https://127.0.0.1:7890
  #使用 socks5 代理
  git config --global http.proxy socks5://127.0.0.1:7890
  git config --global https.proxy socks5://127.0.0.1:7890
  ```

  

- 单独给 GitHub 设置代理（推荐）

  ```bash
  #使用 socks5 代理（推荐）
  git config --global http.https://github.com.proxy socks5://127.0.0.1:7890
  #使用 http 代理（不推荐）
  git config --global http.https://github.com.proxy http://127.0.0.1:7890
  ```



### 取消代理

如果想取消代理，则执行命令：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```



### 参考链接

- [github 设置代理- 正义的伙伴！](https://www.cnblogs.com/whm-blog/p/16869052.html)
