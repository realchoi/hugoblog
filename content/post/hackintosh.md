---
title: "给台式机安装了黑苹果"
slug: "hackintosh-on-a-desktop-pc"
tags: [Hackintosh, 黑苹果, macOS]
categories: [数码]
date: 2024-12-17T20:30:53+08:00
lastmod: 2024-12-17T20:30:53+08:00
draft: false
---

### 放图

![hackintosh](https://s3.bmp.ovh/imgs/2024/12/17/26915029b074cc22.png)



### 起因

最近发布的新款 M4 版本的 Mac mini，掀起了一波 Mac 热，理由无他，就是性能强 + 价格低。

**性能强**，指的是这颗 M4 芯片性能强悍，配合上苹果公司终于舍得将起步的 RAM 提高到 16GB；**价格低**，指的是配合使用国家补贴，能做到 3500 元左右的起售价。

两者结合在一起，确实让人心动。

所以，这段时间以来，无论是用过 macOS 的，还是没用过 macOS 的，都想搞个新款 Mac mini 玩玩，我也是没用过的那批人之一。

但是！穷限制了我的行动，家里已经有一台刚攒没多久的主机，另外再买一台 Mac mini，或多或少有点浪费了。

对哦，不是有一台主机了吗，把它卖二手，换的钱搞一台 Mac mini 不行吗？于是我把它上架到了闲鱼，本着不能另外掏钱的原则，我给它标价 3600。可惜，过了很久，只遇到两个带着大刀的买家来询问（~~这 TM 绝对是来捣乱的！~~）......

所以，放弃吧，商品下架，不折腾了。

就这样又过了好几天，但是，每天都能看到 Mac mini 的广告，心里还是痒痒，烦得很。

于是又打起了黑苹果（hackintosh）的主意......



### 学习

以前我给自己的 Dell XPS 9360 笔记本装过黑苹果，所以在我印象中，黑苹果不是那么简单弄成的，需要考虑很多驱动、兼容性等问题。

所以走上了学习之旅。

从了解到的信息来看，以前 hackintosh，使用的主流工具是 clover（四叶草🍀），但是现在这个工具被淘汰了，取而代之的是 [OpenCore](https://dortania.github.io/OpenCore-Install-Guide/ "OpenCore 官网")（简称 OC）。所以想要大致了解清楚 hackintosh 的流程，OpenCore 的官方教程还是需要看一下的，有不懂的可以先放放，但是得看一遍。

上面说到，黑苹果难的是解决驱动、兼容性等问题，搁以往，收集 EFI 配置文件，确实很让人头疼。但是现在我们比较幸福，因为有大佬制作了一键配置 EFI 的工具，名叫 [RapidEFI](https://github.com/JeoJay127/RapidEFI-Tool "RapidEFI Github")，基本上点点就能生成一个基本可用的 EFI 了。

![RapidEFI](https://github.com/JeoJay127/RapidEFI-Tool/blob/main/images/intel-desktop.png)



### 配置

首先说明一下，想玩黑苹果，最好避开 N 卡（NVIDIA 显卡），因为比较新的 NVIDIA 显卡，基本上都不支持黑苹果；另外，尽量不使用 AMD 的 CPU，虽然 AMD CPU 可以黑，但是存在一些软件的兼容性问题，比如虚拟化（docker）啥的，虽然能解决，但是很折腾。

所以，纵然我的主机配置，**刚好 TMD 是 AMD + NVIDIA**（咬牙切齿），我还是毅然决然地给置换了（差价亏了差不多两百块）！！！

现在我的配置是 Intel i5-12400F 的 CPU，以及 AMD RX6600 的显卡。



### 制作

> 说明：参考 RapidEFI、国光、大头菜等各位大佬的教程。

#### EFI 生成

使用 RapidEFI 工具，制作最基本的 EFI 文件，然后根据网上找到的一些教程，进行了补充和精简（实际上到现在我也没摸清哪些必须，哪些可删）。

#### BIOS 配置

刚好，RapidEFI 的教程中，也有关于 BIOS 配置的介绍。

![BIOS 配置](https://github.com/JeoJay127/RapidEFI-Tool/blob/main/images/Desktop-4th-bios.png)

#### U 盘定制

直接参考国光的教程：https://apple.sqlsec.com/6-%E5%AE%9E%E7%94%A8%E5%A7%BF%E5%8A%BF/6-1/

#### EFI 完善

在 Windows 系统下，可以使用 [OCAuxiliaryTools](https://github.com/ic005k/OCAuxiliaryTools "OCAT Github") 对其进行配置，然后我是参考 B 站 UP 主大头菜的视频来操作的。

视频 1：https://www.bilibili.com/video/BV1Bi4y1S7DN

视频 2：https://www.bilibili.com/video/BV14a41147Kk

#### 双系统

如果你想装 Windows + macOS 双系统，还需要在磁盘的 ESP 分区中添加 OC 引导，具体查看国光的教程：https://apple.sqlsec.com/5-%E5%AE%9E%E6%88%98%E6%BC%94%E7%A4%BA/5-6/



### 我的 EFI

下面放一下我的 EFI 文件，有相同电脑配置的朋友可以自取，提取密码：`hackintosh`。

OneDrive 链接：https://1drv.ms/u/c/dd23cc4b8ead9b66/ER9CXJkRc7ZOlIFuxO1z2zgBlgYkRqA2SS-alWRBF9NBbg?e=dsVykj