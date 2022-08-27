---
title: "Shadowsocks 一键安装脚本（四合一）"
slug: "shadowsocks-installation-scripts"
tags: [Shadowsocks, 防火墙]
date: 2017-06-02
categories: [技术]
draft: false
---
![](https://ws1.sinaimg.cn/large/005Ib0ZLgy1fjcgxosy6mj30p00dwdg3.jpg)

## 前言

不说你也懂，还是不说了。

## 本脚本适用环境

系统支持：CentOS 6+，Debian 7+，Ubuntu 12+
内存要求：≥128M
日期：2017 年 5 月 3 日
<br>

## 关于本脚本

 1、一键安装 Shadowsocks-Python， ShadowsocksR， Shadowsocks-Go， Shadowsocks-libev 版（四选一）服务端；
 2、各版本的启动脚本及配置文件名不再重合；
 3、每次运行可安装一种版本；
 4、支持以多次运行来安装多个版本，且各个版本可以共存（注意端口号需设成不同）；
 5、若已安装多个版本，则卸载时也需多次运行（每次卸载一种）；
 6、Shadowsocks-Python 和 ShadowsocksR 安装后不可同时启动（因为本质上都属 Python 版）。

<br>

## 默认配置

服务器端口：自己设定（如不设定，默认为 8989）
密码：自己设定（如不设定，默认为 teddysun.com）
备注：脚本默认创建单用户配置文件，如需配置多用户，请手动修改相应的配置文件后重启即可。
<br>

## 客户端下载

常规版 Windows 客户端
https://github.com/shadowsocks/shadowsocks-windows/releases

ShadowsocksR 版 Windows 客户端
https://github.com/shadowsocksr/shadowsocksr-csharp/releases
<br>

## 使用方法

使用 root 用户登录，运行以下命令：
```bash
wget --no-check-certificate -O shadowsocks-all.sh https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks-all.sh
chmod +x shadowsocks-all.sh
./shadowsocks-all.sh 2>&1 | tee shadowsocks-all.log
```
安装完成后，脚本提示如下：
```bash
Congratulations, your_shadowsocks_version install completed!
Your Server IP        :your_server_ip
Your Server Port      :your_server_port
Your Password         :your_password
Your Encryption Method:aes-256-cfb

Welcome to visit:https://teddysun.com/486.html
Enjoy it!
```
卸载方法：
若已安装多个版本，则卸载时也需多次运行（每次卸载一种）。

使用 root 用户登录，运行以下命令：
```bash
./shadowsocks-all.sh uninstall
```
<br>

## 启用脚本

启动脚本后面的参数含义，从左至右依次为：启动，停止，重启，查看状态。

Shadowsocks-Python 版：
```bash
/etc/init.d/shadowsocks-python start | stop | restart | status
```
ShadowsocksR 版：
```bash
/etc/init.d/shadowsocks-r start | stop | restart | status
```
Shadowsocks-Go 版：
```bash
/etc/init.d/shadowsocks-go start | stop | restart | status
```
Shadowsocks-libev 版：
```bash
/etc/init.d/shadowsocks-libev start | stop | restart | status
```
<br>

## 各版本默认配置文件

Shadowsocks-Python 版：
/etc/shadowsocks-python/config.json

ShadowsocksR 版：
/etc/shadowsocks-r/config.json

Shadowsocks-Go 版：
/etc/shadowsocks-go/config.json

Shadowsocks-libev 版：
/etc/shadowsocks-libev/config.json
<br>

## 版权声明

本文转载于[秋水逸冰](https://teddysun.com/486.html)。