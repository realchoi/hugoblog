---
title: "Asp.Net Core WebApi 接口入参默认值"
slug: "default-value-of-parameters-in-dotnetcore-webapi"
tags: [dotNET, dotNET Core, WebApi]
categories: [技术]
date: 2022-11-09T20:13:15+08:00
lastmod: 2022-11-09T20:13:15+08:00
draft: false
---

### 说明

有时候我们在设计一个 api 的时候，希望能给它设置一个默认值，在调用方没有给该参数传值的时候使用该默认值，最常见的例子就是获取数据列表接口，有两个用来分页的参数：`pageIndex` 和 `pageSize`，如果调用房没有传参，则我们默认取表中第 1 页的前 10 条数据。



### 实现

搜了一下 .net core 好像没有类似的解决方案，但是在 swagger 中可以实现，就是定义入参 DTO 的时候，在注释中添加一个 `example` 属性，如下：

``` csharp
/// <summary>
/// 第几页
/// </summary>
/// <example>1</example>
public int PageIndex { get; set; } = 1;

/// <summary>
/// 每页大小
/// </summary>
/// <example>50</example>
public int PageSize { get; set; } = 10;
```

这样我们在打开 swagger 页面查看接口的时候，就能看到这两个参数的默认值：

![](https://s3.bmp.ovh/imgs/2022/09/28/b4cec3f367e0d5d9.png)

然后我们在 swagger 中模拟调用的时候就可以将这两个默认值自动带上。

*没有在实际前端页面调用的时候试过该方法是否可行，待验证。*
