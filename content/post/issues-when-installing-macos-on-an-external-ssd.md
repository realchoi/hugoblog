---
title: "在外接 SSD 中安装 macOS 遇到的一些问题"
slug: "issues-when-installing-macos-on-an-external-ssd"
tags: [Mac, macOS, MacMini]
categories: [数码]
keywords:
- Mac
- macOS
- Mac mini
- 数码
- digital
description: "此文记录一下给 Mac mini 在外接硬盘中安装 macOS 系统时遇到的一些问题。"
summary: "此文记录一下给 Mac mini 在外接硬盘中安装 macOS 系统时遇到的一些问题。"
date: 2025-08-11T14:43:50+08:00
lastmod: 2025-08-11T14:43:50+08:00
draft: false 
---

### 给 Mac mini 买的搭配硬件

今年（2025）年初，趁着国补+教育优惠，入手了一台 Mac mini，也算是终于“洗白”了，此前顶多玩玩黑的，博客中也有[记录](https://smc.im/post/hackintosh-on-a-desktop-pc/)。

由于入手的是 24+256 的版本，存储空间逐渐就不够用了，所以在网上开始搜索扩容的方案，最终选择了外接 SSD 的形式。

我的硬盘是西部数据的 WD_BLACK SN7100 1TB；硬盘盒则入手的是 ITGZ 的 40Gbps 速率版本，芯片是 JHL7440+RTL9210，同时带主动散热风扇。

拍了几张硬盘盒的照片，和 Mac mini 搭配起来，还是挺好看的：

<img src="https://s3.bmp.ovh/imgs/2025/08/11/6efb230ffc0b20fd.jpg" alt="ITGZ 硬盘盒" style="zoom:25%;" />

<img src="https://s3.bmp.ovh/imgs/2025/08/11/9636214d263035da.jpg" alt="ITGZ 硬盘盒" style="zoom:25%;" />

<img src="https://s3.bmp.ovh/imgs/2025/08/11/1726998094b19d76.jpg" alt="ITGZ 硬盘盒" style="zoom: 25%;" />

西数的 SN7100 属于黑盘梯队，PCIE4.0 协议，理论速度说是可以达到 7200MB/s，我将其装在硬盘盒上，然后插在雷雳 4 接口上，测试的速度受限于盒子、线材、接口等等，读写在 2800MB/s 左右，还是可以接受的：

<img src="https://s3.bmp.ovh/imgs/2025/08/11/2428c5f02a4c8355.png" alt="硬盘速度" style="zoom: 50%;" />

然后我就在外置硬盘中准备安装系统了，具体的安装方法这里不再展开，特别简单，而且网上很多详细的教程。我只记录一下其中遇到的问题。

### 所选宗卷的可用空间不足

看网上的教程，操作都特别简单，还以为自己也可以顺畅完成安装呢，却没想到第一步就卡住了：

<img src="https://s3.bmp.ovh/imgs/2025/08/11/b8aa83eb83a7468c.jpeg" alt="空间不足" style="zoom: 67%;" />

看到这个提示，我有点懵：这个新买的 SSD 显示的可用空间将近 1TB，为什么还提示空间不足？网上搜了一下也没搜到，我前后尝试了好几次“抹掉”（格式化）硬盘，依然不行，我有点心慌了，还以为是 SSD 出了问题。于是在一个论坛发个[帖子](https://linux.do/t/topic/855784)问了一下，没想到有大佬给出了排查思路：是不是原磁盘空间不太够了？

> 内置的盘空间不够，要删到能装为止。他这提示十分具有迷惑性，让人觉得是要被装系统的盘空间不足，老坑了

我去！我的原磁盘确实没多少空间了，我尝试删除一些没用的数据后，大约剩余 30GB 左右再尝试安装，果然，可以了。。。

苹果这提示，我还以为是我的新硬盘空间不够，确实很迷惑人。