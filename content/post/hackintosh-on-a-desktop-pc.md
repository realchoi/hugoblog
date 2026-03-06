---
title: "给台式机安装了黑苹果系统"
slug: "hackintosh-on-a-desktop-pc"
tags: [Hackintosh, 黑苹果, macOS]
categories: [数码]
keywords:
- 黑苹果
- hackintosh
- 教程
- tutorial
description: "我的折腾：Intel i5 12400F 处理器、AMD RX 6600 显卡安装 macOS 15.2 黑苹果系统（hackintosh）的过程记录。"
summary: "我的折腾：Intel i5 12400F 处理器、AMD RX 6600 显卡安装 macOS 15.2 黑苹果系统（hackintosh）的过程记录。"
cover:
  image: "/covers/hackintosh-desktop.svg"
  alt: "给台式机安装黑苹果系统封面"
  relative: false
date: 2024-12-17T20:30:53+08:00
lastmod: 2024-12-21T15:14:59+08:00
draft: false
---

### 说说起因

最近 Apple 发布的新款 M4 版本的 Mac mini，掀起了一波 Mac 热，理由无他，就是性能强 + 价格低。

**性能强**，指的是这颗 M4 芯片的性能，相比前几代更加强悍了，而且，Apple 终于舍得将起步的 RAM 提高到 16GB（~~据说是供应商不提供 8GB 的 RAM 了🤣~~）！

**价格低**，指的是这段时间配合使用国家补贴，能做到 3500 元左右的起售价！

两者结合在一起，3500 元购买一台 16GB 的 M4 芯片的 Mac mini，谁不心动呢？

所以，这段时间以来，无论是用过 macOS 的，还是没用过的，都想搞个新款 Mac mini 玩玩，体验一下高贵的 macOS 到底是啥样。我也是没用过的那批人之一。

但是！穷限制了我的行动，家里已经有一台刚攒没多久的主机，另外再买一台 Mac mini，或多或少有点浪费了。

对哦，不是有一台主机了吗，把它卖二手，换的钱搞一台 Mac mini 不行吗？于是我把它上架到了闲鱼，本着不能另外掏钱的原则，我给它标价 3600。可惜，过了很久，只遇到两个带着大刀的买家来询问......（~~这 TM 绝对是来捣乱的！~~）

所以，放弃吧，商品下架，不折腾了。

就这样又过了好几天，但是，每天都还能看到关于新款 Mac mini 的广告/文章/分享，心里还是痒痒，烦得很。

于是又打起了黑苹果（hackintosh）的主意......



### 学习之旅

以前我给自己的 Dell XPS 9360 笔记本装过黑苹果，所以在我印象中，黑苹果不是那么简单弄成的，需要考虑很多驱动、兼容性等问题。

所以走上了学习之旅。

从了解到的信息来看，以前 hackintosh，使用的主流工具是 clover（四叶草🍀），但是现在这个工具被淘汰了，取而代之的是 [OpenCore](https://dortania.github.io/OpenCore-Install-Guide/ "OpenCore 官网")（简称 OC）。所以想要大致了解清楚 hackintosh 的流程，OpenCore 的官方教程还是需要看一下的，有不懂的可以先放放，但是建议得从头过一遍，以了解一下 EFI 文件的结构啥的。

上面说到，黑苹果难的是解决驱动、兼容性等问题，搁以往，收集 EFI 配置文件，确实很让人头疼。但是现在我们比较幸福，因为有大佬制作了一键配置 EFI 的工具，名叫 [RapidEFI](https://github.com/JeoJay127/RapidEFI-Tool "RapidEFI Github")，基本上点点鼠标就能生成一个可用的 EFI 了，然后再看看大佬们的教程，完善或者精简一下配置，你的 EFI 就很不错了。

![RapidEFI 截图](https://s3.bmp.ovh/imgs/2024/12/18/41e68a0be5b80161.png)



### 电脑配置

首先说明一下，想玩黑苹果，最好避开 N 卡（NVIDIA 显卡），因为新的 N 卡，都不支持黑苹果，老 N 卡，又太老了......另外，尽量不使用 AMD 的 CPU，虽然 AMD 的 CPU 可以操作，但是还是存在一些软件的兼容性问题，比如虚拟化（docker）啥的，虽然能解决，但是很折腾。

所以，纵然我以前的主机配置，**刚好 TMD 是 AMD + NVIDIA**（咬牙切齿），我还是毅然决然地在闲鱼上给置换成了 Intel + AMD！！！

我以前的配置：AMD 5600 的 CPU，以及 NVIDIA RTX 3050 的显卡；

我现在的配置：Intel i5 12400F 的 CPU，以及 AMD RX 6600 的显卡。

差价亏了差不多两百块。

如果你对不玩游戏（本来也不推荐在 macOS 上玩游戏）、不剪辑高清视频，总之不搞一些很消耗显卡资源的事情，买一个老点的 AMD 显卡，也是可以的，特别是对于仅仅用来写代码的程序员来说，显卡的作用不是特别重要。

![黑苹果装机所用显卡照片](https://s3.bmp.ovh/imgs/2024/12/18/eec661a51e9fcc66.webp)



### EFI 制作流程

> 说明：参考 RapidEFI、国光、大头菜等各位大佬的教程。

#### EFI 生成

使用 RapidEFI 工具，制作最基本的 EFI 文件，然后根据网上找到的一些教程，进行了补充和精简（实际上到现在我也没摸清哪些必须，哪些可删）。

#### BIOS 配置

RapidEFI 的教程中，有关于 BIOS 配置的介绍，具体可以展开 `平台信息` 项目下面的 `详细信息` 页面查看：

![BIOS 配置说明](https://s3.bmp.ovh/imgs/2024/12/18/21d09b4c243f5c26.png)

#### U 盘定制

直接参考国光的教程：[USB 定制](https://apple.sqlsec.com/6-%E5%AE%9E%E7%94%A8%E5%A7%BF%E5%8A%BF/6-1/)

#### EFI 完善

在 Windows 系统下，可以使用 [OCAuxiliaryTools](https://github.com/ic005k/OCAuxiliaryTools "OCAT Github") 对其进行配置，然后我是参考 B 站 UP 主大头菜的视频来操作的。

视频 1（B 站）：[【Windows&macOS】完美双系统系列教程第2集，Windows环境下配置OC引导](https://www.bilibili.com/video/BV1Bi4y1S7DN)

视频 2（B 站）：[【Windows&macOS】完美双系统系列教程第3集，安装macOS](https://www.bilibili.com/video/BV14a41147Kk)

#### 双系统

如果你想装 Windows + macOS 双系统，还需要在磁盘的 ESP 分区中添加 OC 引导，具体查看国光的教程：[完善引导](https://apple.sqlsec.com/5-%E5%AE%9E%E6%88%98%E6%BC%94%E7%A4%BA/5-6/)



### 成果展示

![hackintosh](https://s3.bmp.ovh/imgs/2024/12/17/26915029b074cc22.png)

目前这台电脑运行良好，~~但是也有不足之处，比如，点击睡眠后，鼠标动一下又醒过来；当时睡眠了，但是过两个小时又自动醒了......~~

~~针对这些睡眠的问题，网上也有相关解决方案，我最近没有时间搞，就放一边了。~~

**2024/12/21 更新：**

闲暇之余，我排查了一下我的电脑自动唤醒的原因，方法是使用终端执行命令：

```bash
log show --last 1d | grep "Wake reason"
```

该命令会返回最近一天内，电脑自动唤醒的原因。

我这边自动唤醒的原因，主要是 `Wake reason: RTC (Alarm)`，针对该原因，可以使用以下方法完美解决：

- 使用 OCAT 工具（OCAuxiliaryTools）打开 config.plist 文件

- 侧边栏打开 `Kernal` 页面

- 打开 `Patch` 选项卡

- 点击右侧 `+` 号新增条目

- 然后按照下面的内容进行填写：

  | Identifier                | Base                                              | Comment                     | Count | Enabled | Replace |
  | ------------------------- | ------------------------------------------------- | --------------------------- | ----- | ------- | ------- |
  | com.apple.driver.AppleRTC | __ZN8AppleRTC18setupDateTimeAlarmEPK11RTCDateTime | Disable RTC wake scheduling | 1     | true    | C3      |

- 保存配置，然后重启电脑，正常情况下基本上就生效了。

可以参考以下截图进行操作：

![配置 config.plist](https://s3.bmp.ovh/imgs/2024/12/21/1c49c1376914b1ba.png)



### 分享我的 EFI

下面放一下我的 EFI 文件（已解决睡眠自动唤醒的问题），有相同电脑配置的朋友可以自取，提取密码：`hackintosh`。

OneDrive 链接：[点我 (Click Here)](https://1drv.ms/u/c/dd23cc4b8ead9b66/Ebn5MZnNzX1BoOzA0u-fd94BfV4gf-40UUa6OpXUUUdvsw?e=YUGEZ7)



### 致谢名单

> 排名不分先后

- 国光（[https://apple.sqlsec.com/](https://apple.sqlsec.com/)）
- RapidEFI（[https://github.com/JeoJay127/RapidEFI-Tool](https://github.com/JeoJay127/RapidEFI-Tool)）
- 大头菜（[https://space.bilibili.com/16323318](https://space.bilibili.com/16323318)）