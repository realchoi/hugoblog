---
title: "Uninstall hasn't detected folder of JetBrains Rider installation"
slug: "uninstall-has-not-detected-folder-of-jetBrains-rider-installation"
tags: [JetBrains, IDEA, Rider]
categories: [IDE]
keywords:
- JetBrains
- IDEA
- Rider
- 教程
- tutorial
description: "解决卸载 JetBrains 家的 IDE 软件（如 Rider）时，遇到的找不到卸载程序的错误。"
summary: "解决卸载 JetBrains 家的 IDE 软件（如 Rider）时，遇到的找不到卸载程序的错误。"
date: 2023-08-07T15:10:12+08:00
lastmod: 2023-08-07T15:10:12+08:00
draft: false
---

今天在卸载 Rider 程序（运行 `Uninstall.exe` 程序）时，遇到找不到卸载程序的错误。

完整错误提示为：`Uninstall hasn't detected folder of JetBrains Rider installation. Probably uninstall.exe was moved from the installation folder`，看上去是缺失 `uninstall.exe` 程序，但是我看程序的安装目录下面是有这个文件的，就很奇怪。

通过搜索，在 StackOverflow 上面看到别人给的可用的解决方法：

>- 使用管理员权限打开 Powershell，然后执行以下命令：
>
>  ```powershell
>  cd 'C:\Program Files\JetBrains\JetBrains Rider 2022.2\bin'
>  New-Item -Path 'IdeaWin64.dll' -ItemType File
>  ```
>
>- 再次点击 `Uninstall.exe` 卸载应该是可以成功的。

该方法也适用于 JetBrains 系列的其他 IDE 软件，如 IntelliJ IDEA、WebStorm、DataGrip 等等。