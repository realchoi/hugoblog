---
title: "在 .net 6 中重复读取请求参数 body"
slug: "repeated-reading-of-request-parameter-body-in-dotnet6"
tags: [dotNET Core, 文件流]
categories: [技术]
date: 2022-12-06T14:37:16+08:00
lastmod: 2022-12-06T14:37:16+08:00
draft: false
---

### 一句话总结

一般情况下，`HttpContext.Request.Body` 流对象不允许被重复读取，这是因为该流对象的 `Position` 是不允许进行修改操作的，一旦操作会直接抛出异常。

若希望重复读取该流对象，微软引入了 `HttpContext.Request` 的扩展方法 `EnableBuffering()`，调用这个方法后，我们可以通过重置流对象的读取位置，来实现对 `HttpContext.Request.Body` 的重复读取。

注意：`EnableBuffering()` 方法每次请求设置一次即可，即在准备读取 `HttpContext.Request.Body` 之前设置。
