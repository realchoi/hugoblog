---
title: "在 .net core 中实现下载文件的接口"
slug: "a-download-file-api-in-aspnetcore"
date: 2022-08-22T20:45:05+08:00
tags: [dotNET Core, WebApi, 文件流]
categories: [技术]
draft: false
---

## 缘起
今天写个下载文件的接口，可能对很多人来说很简单，但是我却遇到了这样那样的错误，这里记录一下。



## Controller 层的返回类型
在 Asp.net core（现在叫 .NET 6）中，想要写一个下载文件的 WebAPI 接口，直接返回 `FileResult` 就行，至于如何初始化一个 `FileResult` 对象，可以通过以下方式：
- 手动初始化一个 `FileStreamResult` 对象：
``` c sharp
return new FileStreamResult(fileStream, "application/stream")
{
    FileDownloadName = fileName
};
```
- 或者直接使用官方封装好的 `File` 方法：
``` csharp
return File(fileStream, "application/stream", fileName);
```

**当然，前提是得获取到文件的流（`Stream`）**。



## 中间层的实现方式
先看 **错误** 的方式（伪代码）：
``` c sharp
public async Task<Stream> GetFileStream() 
{
    // 生成 json 字符串，写入文本
    var str = "This is content of the file.";
    // 初始化一个在内存中的流对象：MemoryStream
    using var stream = new MemoryStream();
    // 初始化一个写入流对象
    using var writer = new StreamWriter(stream);
    await writer.WriteAsync(str);
    return stream;
}
```

如果直接上述方法，则会报 `无法读取已经关闭的流` 错误。其实这个问题很容易看出来是怎么回事，一定是 `using` 语句块捣的鬼：离开 `using` 语句块的时候，流被自动关闭了，所以外层方法是获取不到流信息的。针对这个报错的改进就是去掉 `using` 语句，如下所示：

``` c sharp
public async Task<Stream> GetFileStream() 
{
    // 生成 json 字符串，写入文本
    var str = "This is content of the file.";
    // 初始化一个在内存中的流对象：MemoryStream
    var stream = new MemoryStream();
    // 初始化一个写入流对象
    var writer = new StreamWriter(stream);
    await writer.WriteAsync(str);
    return stream;
}
```
此时调用接口，会发现生成的流还是有问题：接口返回的文件长度是 0，这个原因其实是因为生成的 `stream` 流对象长度为 0，而后者的进一步原因，可能是没有调用 `writer.Flush()` 方法以确保数据写入。

加上 `writer.Flush()` 语句后，虽然 `stream` 对象长度不为 0 了，但是接口返回的文件长度依然是 0。通过调试可以发现，`stream` 流对象的 `Position` 停在了文件末尾，所以返回时读取不到文件流数据，此时将其 `Position` 设置为 0，即可从头开始读取数据。

最终改进后的方法如下：
``` c sharp
public async Task<Stream> GetFileStream() 
{
    // 生成 json 字符串，写入文本
    var str = "This is content of the file.";
    // 初始化一个在内存中的流对象：MemoryStream
    var stream = new MemoryStream();
    // 初始化一个写入流对象
    var writer = new StreamWriter(stream);
    await writer.WriteAsync(str);
    // 以下两句需要加上
    await writer.FlushAsync();
    stream.Position = 0;
    return stream;
}
```



## 总结

如下总结，是在网上摘抄的：

> - `MemoryStream` 如果使用 `using` 语句块，会在离开代码块的时候自动关闭。而下载文件的时候不能提前关闭流，否则就会读取不到。.NET Core 其实会自动处理 `using` 语句的关闭问题，无需手动处理。
> - 文件生成的过程，是从开头到末尾的方向，所以生成文件后它的 `Position` 走到了末尾，最后在返回文件流的时候，我们需要手动将 `Position` 设置到开头（0 或者其他想要读取文件的位置），才能读取到文件内容。
> - 使用 `StreamWriter` 时最好在写入内容后再调用其 `Flush()` 方法，确保缓冲数据写到了流中。
