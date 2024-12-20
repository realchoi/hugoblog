---
title: "使用 EF Core 查询数组参数与数据库中的数组字段是否有交集"
slug: "query-whether-array-parameter-intersect-with-array-field-in-the-database-in-ef-core"
tags: [entity framework, dotNET Core]
categories: [技术]
keywords:
- entity framework
- EF
- dotnet
- .net
- dotNET Core
- 开发
- developer
- 教程
- tutorial
description: "使用 EF Core 查询数据库数组之间的交集。"
summary: "使用 EF Core 查询数据库数组之间的交集，场景举例：表 `student` 中有一个数组类型的字段 `hobbies`，用来记录某个学生的所有业余爱好，此时想要查询业余爱好中包含羽毛球、篮球、吉他的所有学生，即入参为数组 `hobbiesFilter`：`['羽毛球', '篮球', '吉他']`。"
date: 2023-03-12T15:00:14+08:00
lastmod: 2023-03-12T15:00:14+08:00
draft: false
---

### 场景举例

表 `student` 中有一个数组类型的字段 `hobbies`，用来记录某个学生的所有业余爱好，此时想要查询业余爱好中包含羽毛球、篮球、吉他的所有学生，即入参为数组 `hobbiesFilter`：`['羽毛球', '篮球', '吉他']`。



### 解决方法

如果我们直接使用如下语句：`var students = _dbContext.Set().Where(p => p.Hobbies.Any(h => hobbiesFilter.Contains(h))).ToList();`，EF Core 会抛出类似无法翻译 SQL 语句的错误。有两种解决方法（**推荐第二种**）。



#### 方法一（在内存中处理）

在**数据量不大**的情况下，可以将数据先全部取出来，然后在内存中进行条件过滤。如：

```c#
// 第一步，将所有数据取出来
var students = _dbContext.Set<Student>().ToList();
// 第二步，在内存中进行过滤
var result = students.Where(p => p.Hobbies.Any(h => hobbiesFilter.Contains(h)));
```

一般上述方法不推荐。



#### 方法二（提前构建查询 SQL）

如果数据量很大，第一种方法就行不通了，因为这样会撑爆内存，我们可以使用拼接条件的方法 ，来让 EF Core 先构建查询 SQL，然后从数据库中查询想要的数据，方法如下：

```c#
// 第一步，声明一个条件表达式
Expression<Func<Student, bool>> expression = p => false;
// 第二步，循环入参，拼接构建条件表达式
foreach (var h in hobbiesFilter)
{
    expression = expression.Or(p => p.Hobbies.Contains(h));
}
// 第三步，查询数据库
var students = _dbContext.Set<Student>().Where(expression).ToList();
```