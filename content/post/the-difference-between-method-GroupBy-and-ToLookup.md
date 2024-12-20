---
title: "GroupBy 方法和 ToLookup 方法之间的区别"
slug: "the-difference-between-method-GroupBy-and-ToLookup"
tags: [C#]
categories: [技术]
keywords:
- C#
- CSharp
- C Sharp
- 开发
- developer
- 教程
- tutorial
description: "C# 中的两个典型的分组函数：GroupBy 和 ToLookup 之间的区别。"
summary: "C# 中的两个典型的分组函数：GroupBy 和 ToLookup 之间的区别。"
date: 2023-01-31T15:13:57+08:00
lastmod: 2023-01-31T15:13:57+08:00
draft: false
---

### 相同之处

C# 中的 `GroupBy` 方法，大家一般都知道是用来给数据集合做分组的，至于 `ToLookup` 方法，我本人用的比较少，估计很多人也不清楚是什么作用，其实它也可以对集合做**分组**操作。

但是两者也具有一些不同之处。



### 不同之处

- `ToLookup` 返回的是 `ILookup<TKey, TSource>`， 同时 `ILookup<TKey, TSource>` 也实现了 `IEnumerable<IGrouping<TKey, TSource>>` 接口。`GroupBy` 直接返回了 `IEnumerable<IGrouping<Tkey, TSource>>`。`ILookup<TKey, TSource>` 有一个方便的属性索引器，所以它具有像字典一样的行为，但 `IEnumerable<IGrouping<Tkey, TSource>>` 不能使用索引器来操作。
- `ToLookup` 是立即执行的，而 `GroupBy` 是懒加载的。针对数据库的 Linq To Database 来说， `GroupBy` 会被解析成 SQL 中的 `group by` 关键词，所以它是在服务器端被执行的而不是在客户端，因此如果想在 group key 上做一些过滤条件，比如：`having`，这是完全支持的；相反 `ToLookup` 是将所有的数据加载到内存中，然后在内存中做分组操作，所以刚才说的附加过滤操作是无法支持的。
