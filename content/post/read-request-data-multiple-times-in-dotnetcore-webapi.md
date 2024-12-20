---
title: "Asp.Net Core WebApi 中多次读取请求数据"
slug: "read-request-data-multiple-times-in-dotnetcore-webapi"
tags: [dotNET, dotNET Core, WebApi]
categories: [技术]
keywords:
- .net
- dotNET
- dotNET Core
- WebApi
- 教程
- tutorial
description: "怎样才能正确地重复读取 HttpContext.Request.Body 流对象？"
summary: "怎样才能正确地重复读取 HttpContext.Request.Body 流对象？"
date: 2022-10-09T19:57:12+08:00
lastmod: 2022-10-09T19:57:12+08:00
draft: false
---

### 说明

有时候我们在处理接口的业务之前，可能需要对请求数据进行预处理，或者在业务处理之后再次统一处理请求数据，该场景常见于 AOP 编程，比如 .net core 中的 `filter`（过滤器）、`Middleware`（中间件） ，以方便用来记录请求日志、处理请求异常等等。这里的`请求数据`指的是 `Request.Body` 对象，因为大部分请求参数都是放在 HTTP 请求的 Body 对象里的。



### 误区

在上述的场景中，我们一般都能拿到 HTTP 请求的上下文对象，这样一来就能拿到 Body 对象，自然地，我们就直接读取 `Request.Body` 对象。如下代码所示：

``` csharp
public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
{
    // 此处的示例是先执行接口业务，再获取请求数据记录日志
    // 先执行具体的 action 方法
    await base.OnActionExecutionAsync(context, next);
    // 读取请求数据
    using var stream = new StreamReader(context.HttpContext.Request.Body, Encoding.UTF8);
    string body = await stream.ReadToEndAsync();
    
    // 其他逻辑代码...
}
```

如果就这样直接运行，我们会发现，变量 `body` 是空的，没有任何内容！这是因为涉及到对 `Request.Body` 对象的重复读取：我们在过滤器读取 Body 对象之前，接口的模型绑定其实已经读取过一次 Body 对象的内容了，所以在过滤器中再次读取时，通过调试可以发现 `stream` 流对象的读取位置跑到了末尾（即 `Position` 此时不等于 `0`），那我们直接读取当然没有任何内容。



### 解决

可能你觉得既然 `stream` 的读取位置不在开头，那我们手动给它设置在开头不就好了吗？我一开始也是这么想的，所以在读取之前加了一句：

``` diff
	// 读取请求数据
+ 	context.HttpContext.Request.Body.Seek(0, SeekOrigin.Begin);
	using var stream = new StreamReader(context.HttpContext.Request.Body, Encoding.UTF8);
```

本以为绝对可以了，但是你会发现又抛出来一个异常：`System.NotSupportedException: Specified method is not supported.at Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http.HttpRequestStream.Seek(Int64 offset, SeekOrigin origin)`，意思大概就是不支持 `Seek` 方法重置读取位置。这是微软埋的坑，在此就不深入源码了，直接给出最后的解决办法，即在读取之前先调用 `context.Request.EnableBuffering();`，然后才能正确使用。

在 `Startup` 文件中的 `Configure` 方法中添加：

``` diff
public override void Configure(IApplicationBuilder app)
{
    app.Use(next => context =>
    {
+       context.Request.EnableBuffering();
        return next(context);
    });
}
```
