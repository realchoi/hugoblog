---
title: "Markdown 完整版语法手册"
slug: "all-grammars-of-markdown"
tags: [Markdown]
categories: [技术]
date: 2017-07-23T19:15:33+08:00
draft: false
---

![](https://ws1.sinaimg.cn/large/005Ib0ZLgy1fjc8nfo0azj30p00gomy7.jpg)

## Markdown 简介

Markdown 是一种轻量级标记语言，创始人为 John Gruber 。它允许人们使用易读易写的纯文本格式编写文档，然后转换成有效的 XHTML（或者 HTML ）文档。这种语言吸收了很多在电子邮件中已有的纯文本标记的特性。

Markdown 被广泛的应用，最让人熟知的莫过于 Github 了。本文也是使用 Markdown 编辑的。


## Markdown 语法

### 斜体和粗体

**代码：**

```
*这是一段斜体* 或 _这是一段斜体_
**这是一段粗体**
***这是一段加粗斜体***
~~这是一段删除线~~
```

**显示效果：**

* *这是一段斜体*
* **这是一段粗体**
* ***这是一段加粗斜体***
* ~~这是一段删除线~~

### 分级标题

**代码：**

```
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

###  超链接

Markdown 支持两种形式的链接语法：行内式和参考式两种形式，一般地，行内式使用较多。

#### 行内式

**语法说明**

[]里写链接文字，()里写链接地址，()里的""中可以为链接指定 title 属性，title 属性是可选的，其效果是鼠标悬停在链接上显示的文字。

**格式：**

```
[链接文字](链接地址 "链接标题")
```

**代码：**

```
我爱[Markdown](https://zh.wikipedia.org/wiki/Markdown)
我爱[Markdown](https://zh.wikipedia.org/wiki/Markdown "Markdown在维基百科上的词条")
```

**显示效果：**

我爱 [Markdown](https://zh.wikipedia.org/wiki/Markdown)

我爱 [Markdown](https://zh.wikipedia.org/wiki/Markdown "Markdown 在维基百科上的词条")

#### 参考式

参考式超链接一般用在学术论文上面，或者如果某个链接在文章中多处使用，那么使用引用的方式创建链接将是一个非常好的选择，它可以让你对链接进行统一管理。使用方法是，先在文本任何地方声明链接，然后再引用链接。

**代码：**

```
链接引用：
我使用 [Github][1] 搭建了 [自己的博客][2] ，但是由于未做 SEO 优化，[谷歌][3]目前还搜索不到。

链接声明：
[1]:https://pages.github.com "Github Pages"
[2]:https://smc.im "Choi's Notes"
[3]:https://www.google.com "Google"
```

**显示效果：**

我使用 [Github][1] 搭建了 [自己的博客][2] ，但是由于未做 SEO 优化，[谷歌][3]目前还搜索不到。

[1]:https://pages.github.com "Github Pages"
[2]:https://smc.im "Choi's Notes"
[3]:https://www.google.com "Google"

#### 自动链接

Markdown 支持比较简短的自动链接的形式来处理网址和电子邮件信箱，只要使用 <> 包起来，Markdown 就会自动把它转成链接。一般网址的链接文字和链接地址相同。

**代码：**

```
<https://smc.im>
<realchoi123@gmail.com>
```

**显示效果：**

<https://smc.im>

<realchoi123@gmail.com>


### 列表

#### 无序列表

使用*、+、- 表示无序列表。

**代码：**

```
- 无序列表一
- 无序列表二
- 无序列表三
```

**显示效果：**

- 无序列表一
- 无序列表二
- 无序列表三

#### 有序列表

使用数字.，即数字紧接着一个英文句点表示有序列表。

**代码：**

```
1. 有序列表一
2. 有序列表二
3. 有序列表三
```

**显示效果：**

1. 有序列表一
2. 有序列表二
3. 有序列表三

#### 列表缩进

**语法说明：**

列表项目标记通常放在最左边，但是其实也可以缩进，最多 3 个空格，项目标记后面则一定要接着至少一个空格或制表符。

要让列表看起来更漂亮，可以把内容用固定的缩进整理好（显示效果和代码一致）：

- 轻轻的我走了， 正如我轻轻的来； 我轻轻的招手， 作别西天的云彩。 
  那河畔的金柳， 是夕阳中的新娘； 波光里的艳影， 在我的心头荡漾。 
  软泥上的青荇， 油油的在水底招摇； 在康河的柔波里， 我甘心做一条水草！
- 那榆荫下的一潭， 不是清泉， 是天上虹； 揉碎在浮藻间， 沉淀着彩虹似的梦。 
  寻梦？撑一支长篙， 向青草更青处漫溯； 满载一船星辉， 在星辉斑斓里放歌。 
  但我不能放歌， 悄悄是别离的笙箫； 夏虫也为我沉默， 沉默是今晚的康桥！ 
  悄悄的我走了， 正如我悄悄的来； 我挥一挥衣袖， 不带走一片云彩。

但是，也可以偷懒：

**代码：**

```
*   轻轻的我走了， 正如我轻轻的来； 我轻轻的招手， 作别西天的云彩。
那河畔的金柳， 是夕阳中的新娘； 波光里的艳影， 在我的心头荡漾。 
软泥上的青荇， 油油的在水底招摇； 在康河的柔波里， 我甘心做一条水草！
*   那榆荫下的一潭， 不是清泉， 是天上虹； 揉碎在浮藻间， 沉淀着彩虹似的梦。
寻梦？撑一支长篙， 向青草更青处漫溯； 满载一船星辉， 在星辉斑斓里放歌。 
但我不能放歌， 悄悄是别离的笙箫； 夏虫也为我沉默， 沉默是今晚的康桥！ 
悄悄的我走了， 正如我悄悄的来； 我挥一挥衣袖， 不带走一片云彩。
```

**显示效果：**

*   轻轻的我走了， 正如我轻轻的来； 我轻轻的招手， 作别西天的云彩。
  那河畔的金柳， 是夕阳中的新娘； 波光里的艳影， 在我的心头荡漾。 
  软泥上的青荇， 油油的在水底招摇； 在康河的柔波里， 我甘心做一条水草！
*   那榆荫下的一潭， 不是清泉， 是天上虹； 揉碎在浮藻间， 沉淀着彩虹似的梦。
  寻梦？撑一支长篙， 向青草更青处漫溯； 满载一船星辉， 在星辉斑斓里放歌。 
  但我不能放歌， 悄悄是别离的笙箫； 夏虫也为我沉默， 沉默是今晚的康桥！ 
  悄悄的我走了， 正如我悄悄的来； 我挥一挥衣袖， 不带走一片云彩。

#### 包含引用的列表

**语法说明：**

如果需要在列表项目内添加引用，使用 > 加缩进。

**代码：**

```
*   推荐 Java 书籍：
	> 《Thinking in Java》
	> 《颈椎康复指南》
```

**显示效果：**

*   推荐 Java 书籍：
  > 《Thinking in Java》
  > 《颈椎康复指南》

### 引用

**语法说明：**

在需要引用的文本前加上 > 符号。

**代码：**

```
> 这是一句引用一
> 这是一句引用二
> 
> 这是最后一句引用
```

**显示效果：**

> 这是一句引用一
> 这是一句引用二
>
> 这是最后一句引用

Markdown 也允许你偷懒地只在整个段落的第一行最前面加上 > ：

```
> 这是一句引用一
这是一句引用二

> 这是最后一句引用
```

**显示效果：**

> 这是一句引用一
> 这是一句引用二

> 这是最后一句引用

#### 引用的多层嵌套

区块引用可以多层嵌套，只要根据层次加上数量不同的 > ：

**代码：**

```
>>> 最内层引用

>> 中间层引用

> 最外层引用
```

**显示效果：**

>>> 最内层引用

>> 中间层引用

> 最外层引用

#### 引用其他要素

引用的区块内也可以使用其他的 Markdown 语法，包括标题、列表、代码区块等。

**代码：**

```
> 1.	这是第一行列表项
> 2.	这是第二行列表项
> 
> 下面是代码：
> 
> 	System.out.println("Hello, World!");
```

**显示效果：**

> 1.	这是第一行列表项
>     2.这是第二行列表项
>
> 下面是代码：
>
> 	System.out.println("Hello, World!");

### 插入图片

图片的创建方式与超链接相似，而且也有两种写法：行内式和参考式。

语法中图片 alt 的效果是，如果图片由于某些原因不能正常显示，就用 alt 文字代替图片来显示。图片 title 和链接中的 title 一样，效果是鼠标悬停时图片上出现的文字。alt 和 title 都是可选的，可以省略。

#### 行内式

**语法说明：**

```
![图片alt](图片地址 "图片title")
```

**代码：**

```
我爱 Markdown 的图片：
![我爱 Markdown](https://ws1.sinaimg.cn/large/005Ib0ZLgy1fjc8nfo0azj30p00gomy7.jpg "我爱 Markdown")
```

**显示效果：**

我爱 Markdown 的图片：
![我爱 Markdown](https://ws1.sinaimg.cn/large/005Ib0ZLgy1fjc8nfo0azj30p00gomy7.jpg "我爱 Markdown")

#### 参考式

**语法说明：**

在文档需要插入图片的地方写
```
![图片alt](标记)
```

在文档的最后写上
```
[标记]:图片地址 "title"
```

**代码：**

```
我爱 Markdown 的图片：
![我爱 Markdown][Markdown]

[Markdown]:https://ws1.sinaimg.cn/large/005Ib0ZLgy1fjc8nfo0azj30p00gomy7.jpg "我爱 Markdown"
```

**显示效果：**

我爱 Markdown 的图片：
![我爱 Markdown][Markdown]

[Markdown]:https://ws1.sinaimg.cn/large/005Ib0ZLgy1fjc8nfo0azj30p00gomy7.jpg "我爱 Markdown"

### 内容目录

在段落中填写```[TOC]```以显示全文目录的目录结构。

效果参见文章左侧的目录。

### 注脚

**语法说明：**

待续......