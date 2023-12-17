---
title: "使用 Github Actions 自动部署 hugo 博客"
slug: "deploy-hugo-blog-with-github-actions"
tags: [博客, hugo, Github Actions]
categories: [技术, 博客]
date: 2023-12-17T13:03:07+08:00
lastmod: 2023-12-17T13:03:07+08:00
draft: false
---

 hugo 博客系统，大部分人应该都在使用，但是部署的方式，也不相同。Github Actions 这么好用的工具已经出来好几年了，但是一直都没尝试过。本次就简单记录一下使用 Github Actions 自动部署 hugo 博客的方法。



### 两个仓库

如果想使用 Github Actions 自动部署 hugo 博客，则最起码需要创建两个 Github 的仓库。

> 1. 第一个，便是存储博客 .md 源文件的地方，其实就是 hugo 系统；
> 2. 第二个，则是部署 Github Pages 的仓库，仓库名必须是 `<username>.github.io`，这是 github 官方要求的。



### 具体流程

当我们提交博客 .md 源文件到仓库 1 后，利用 Github Actions 自动执行 hugo 的命令，将 .md  源文件生成为 html 文件，放在 `public` 目录下，然后再将 `public` 目录推送到仓库 2；由于仓库 2 是 Github Pages，它接着就会自动执行部署的命令。

这样，我们的博客网站就部署好了，这极大地简化了我们发布文章的流程。



### Github Actions

在管理 .md 源文件的仓库 1，点击 `Actions` 按钮，即可添加工作流文件，该文件一般是以 `.yml` 结尾，这样才能被 Github 识别。我创建的文件名为 `deploy.yml`，内容如下：

``` yaml
name: deploy

on:
    push:
    workflow_dispatch:
    schedule:
        # Runs everyday at 8:00 AM
        - cron: "0 0 * * *"

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout
              uses: actions/checkout@v2
              with:
                  submodules: true
                  fetch-depth: 0

            - name: Setup Hugo
              uses: peaceiris/actions-hugo@v2
              with:
                  hugo-version: "latest"

            - name: Build Web
              run: hugo

            - name: Deploy Web
              uses: peaceiris/actions-gh-pages@v3
              with:
                  PERSONAL_TOKEN: ${{ secrets.PERSONAL_TOKEN }}
                  EXTERNAL_REPOSITORY: realchoi/realchoi.github.io
                  PUBLISH_BRANCH: master
                  PUBLISH_DIR: ./public
                  commit_message: ${{ github.event.head_commit.message }}
```

`on` 表示 GitHub Action 触发条件，上述文件设置了 `push`、`workflow_dispatch` 和 `schedule` 三个条件：

- `push`，当这个项目仓库发生推送动作后，执行 GitHub Action；
- `workflow_dispatch`，可以在 GitHub 项目仓库的 Action 工具栏进行手动调用；
- `schedule`，定时执行 GitHub Action，如设置为北京时间每天早上执行。

首先，需要将上述 `deploy.yml` 中的 `EXTERNAL_REPOSITORY` 改为自己的 GitHub Pages 仓库，如我的设置为 `realchoi/realchoi.github.io`。

此外，因为我们需要从 .md 源文件的仓库 1 推送到外部 GitHub Pages 仓库 2，需要特定权限，所以还得在 GitHub 账户 `Setting - Developer settings - Personal access tokens` （https://github.com/settings/tokens）下创建一个 Token：

![](https://s3.bmp.ovh/imgs/2023/12/17/ef724c440fa25a97.png)

将权限设置为开启 `repo` 与 `workflow`：

![](https://s3.bmp.ovh/imgs/2023/12/17/5a75ae00657ee9fe.png)

最后在我们的 .md 源文件的仓库 1 中添加一个 secret，名称为 `deploy.yml` 中的 `PERSONAL_TOKEN`，值为上一步生成的 token。

现在，就可以往 .md 源文件的仓库 1 中推送一片 .md 文章了，然后就会发现 GitHub Pages 仓库 2 将同步更新。
