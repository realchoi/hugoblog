---
title: 使用 JavaScript 下载文件
slug: "download-file-using-javascript"
date: 2018-12-06
tags:
  - JavaScript
  - Web
categories: [技术, 工作]
draft: false
---

项目上遇到 Excel 导出的功能，应该是个烂大街的需求了，但是自己水平有限，还是捣鼓了一段时间。后端实现都容易，最大的坑反而是文件下载。这里记录一下方便回忆。

大家都知道，下载文件最简单的办法，可能就是在前台添加一个 `a` 标签，然后给其写上 `href` 属性，指向文件的路径即可，但是个人觉得这种方式体验不太友好。于是我就选择使用 `ajax` 请求后台接口来下载，这个时候问题来了 —— 这种方法无法触发浏览器打开保存文件的对话框，所以就没法下载文件。关键是后台方法全部走完，没有异常和报错，前台也平静如水，心里一百个纳闷。

<!--more-->

Google 了一下，发现好多人都在这个地方栽倒了，究其原因，引用网上的解释：** `ajax` 的返回值类型是 `json`、`text`、`html`、`xml` 等类型，也就是说 `ajax` 的接收类型只能是 `string` 字符串，而不能是流类型，而文件下载传输的是流，所以 `ajax` 无法下载文件。但是，`ajax` 仍然可以获得文件的内容，将其保存在内存中，无法直接将文件保存进磁盘，这是因为 JavaScript 不能和磁盘进行交互，否则这会是一个严重的安全问题，JavaScript 无法调用到浏览器的下载处理机制和程序，会被浏览器阻塞**。

看到这里，大概明白了原委。 

当然，我们还是可以使用 `POST` 方式实现文件的下载，那就是通过模拟表单提交。假设我们现在已经从后台接口拿到了文件的路径，在前台可以这么做：

```js
/**
 * 浏览器下载文件
 * @param {any} path 文件路径
 */
function DownloadFile(path) {
    // append 一个 form 表单
    var form = $('<form method="POST" action="DownloadFile">');
    form.append($('<input type="hidden" name="filepath" value="' + path + '">'));
    $('body').append(form);
    // 模拟表单提交
    form.submit();
}
```

即：通过 JavaScript 手动添加一个 `form` 表单，并将其 `action` 属性设置为后台接口的方法，然后在 `form` 中添加几个 `input` 控件，其 `name` 属性必须和后台方法的参数名一致，`value` 属性即为接口参数的值（我这里传递的是前面已经获取的文件的路径），最后模拟触发一下表单的提交动作，即可请求到后台下载文件的接口，浏览器此时会打开保存文件的对话框。

说完 JavaScript 下载文件的坑，再说一下后台的坑：`Content-Type` 设置为 excel 类型，即 `application/vnd.ms-excel` 时，下载不了文件，这个也浪费了我很长时间，到现在也没有搞清楚其中的原因，或者说是自己哪里的操作不对。最后的办法是把 Excel 文件压缩成 ZIP 文件流，并将 `Content-Type` 设置为 `application/x-zip-compressed`，才解决问题（完成需求）。这里贴一下下载文件的部分后台代码（C#），其实就是设置一下几个参数：

```c#
// 设置为压缩文件的格式
Response.ContentType = "application/x-zip-compressed";
// 通知浏览器下载文件，并设置下载的文件的名称
// **** Content-Disposition 属性有两种类型：
// **** attachment：通知浏览器下载文件，而不是在页面打开文件
// **** inline：将文件内容直接显示在页面上
Response.AppendHeader("Content-Disposition", "attachment;filename=" + newfilepath);
// 将文件写入 HTTP 输出响应流
Response.TransmitFile(downloadPath + newfilepath);
Response.End();
```

Over。