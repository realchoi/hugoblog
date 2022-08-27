---
title: "如何在 PostgreSQL 中查询作为索引的字段"
date: 2022-08-26T20:56:34+08:00
tags: ["PostgreSQL", "Database", "数据库", "索引"]
categories: ["技术"]
draft: false
---

## 需求

公司业务上有一个需求，在页面上选择两张表中的各一个字段，将二者建立业务上的外键关系，前提是需要两者都是索引字段，否则会影响后续的查询效率。所以现在需要查询某个字段是否是索引字段。

## 过程

以前没怎么用过 PostgreSQL，所以不太熟（其实对所有数据库都不熟😣），Google 上搜索了很久都没发现该问题的解决方法，有的都是查询某张表中的索引，搞的我一度怀疑是不是 PostgreSQL 不支持该查询。最后时刻，我用全英文关键字又搜索了一次，别说，居然出来了！又是 Stackoverflow！这不禁让我想起前两天看到的一篇[帖子](https://www.v2ex.com/t/874223, "中文互联网已死")，中文互联网真的已经死了。

## 解决

这是 Stackoverflow 上面相关问题的链接：[List columns with indexes in PostgreSQL](https://stackoverflow.com/questions/2204058/list-columns-with-indexes-in-postgresql)

在此我将其中的两个方法摘抄记录一下。

### 多表关联精确查询

直接见 SQL 语句吧：

``` sql
select
    t.relname as table_name, -- 表名
    i.relname as index_name, -- 索引名
    a.attname as column_name -- 字段名
from
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
where
    t.oid = ix.indrelid
    and i.oid = ix.indexrelid
    and a.attrelid = t.oid
    and a.attnum = ANY(ix.indkey)
    and t.relkind = 'r'
    and t.relname like 'test%' -- 此处传表名进行检索
order by
    t.relname,
    i.relname;
```

上述 SQL 的条件中，有一个 `and t.relkind = 'r'` 条件，对该参数的解释是：

| `pg_class.relkind` 的值 | 所表示的类型     |
| :---------------------- | ---------------- |
| `r`                     | `ordinary table` |
| `i`                     | `index`          |
| `S`                     | `sequence`       |
| `v`                     | `view`           |
| `c`                     | `composite type` |
| `t`                     | `TOAST table`    |

### 单表模糊查询

单表指的是询 `pg_indexes` 表，使用该表中的字段 `indexdef` 作为字段名的模糊查询字段（该字段存储的是一个长字符串，里面包含了使用的字段的名称）。SQL 如下：

``` sql
SELECT COUNT(indexname) AS indexcount FROM pg_indexes WHERE tablename = 'mytablename' AND indexdef LIKE '%columnname%';
```

将上述 SQL 的 条件中的 `columnname` 换为想要查询的字段名即可，如果总数大于 0，说明该字段是索引字段。

## 附 MySQL 方法

MySQL 中查询某个字段的索引就很方便了，一句话搞定：

``` sql
SHOW INDEX FROM mytablename WHERE Column_name = 'mycolumnname';
```
