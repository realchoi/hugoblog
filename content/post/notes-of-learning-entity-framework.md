---
title: Entity Framework 学习笔记
slug: "notes-of-learning-entity-framework"
date: 2018-08-01
tags: [dotNET, Entity Framwork]
categories: [技术]
draft: false
---

## 前言

做 .NET 项目时需要用到微软自家的 ORM 框架 Entity Framework，由于之前学识比较浅，没有接触过 Entity Framework，趁着这个机会，赶紧 Google 了一下相关教程，这里就在前辈们的教程基础上，记录一下相关要点，供自己以后查阅。

<!-- more -->

## Entity Framework 在 Code First 模式下与数据库的连接

### Entity Framework 数据库连接配置

在安装了 Entity Framework 后，会自动添加一个 `App.config` 文件，在该文件中配置 `defaultConnectionFactory` 节点，此后不需要再在其他地方进行数据库连接的配置，也不需要指定数据库连接，具体如下：

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <configSections>
    <section name="entityFramework" type="System.Data.Entity.Internal.ConfigFile.EntityFrameworkSection, EntityFramework, Version=4.4.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" requirePermission="false" />
  </configSections>
  <entityFramework>
    <defaultConnectionFactory type="System.Data.Entity.Infrastructure.SqlConnectionFactory, EntityFramework">
      <parameters>
        <parameter value="Data Source=(local); Database=ExamDatabase; User ID=sa; Password=; MultipleActiveResultSets=True" />
      </parameters>
    </defaultConnectionFactory>
  </entityFramework>
</configuration>
```

除了上述配置方法外，还可以配置常用的 `connectionStrings`，修改 `App.config` 文件如下即可：

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <connectionStrings>
    <add name="ExamContext" connectionString="Data Source=(local); Database=ExamDatabase; User ID=sa; Password=; MultipleActiveResultSets=True"
      providerName="System.Data.SqlClient" />
  </connectionStrings>
</configuration>
```

### Entity Framework DbContext 连接数据库

新建一个自定义的继承自 `DbContext` 的类 `ExamContext`：

```C#
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;

namespace Example
{
    public class ExamContext : DbContext
    {
        static ExamContext()
        {
        	Database.SetInitializer<ExamContext>(null);
        	// Database.SetInitializer(new CreateDatabaseIfNotExists<ExamContext>());
        	// Database.SetInitializer(new DropCreateDatabaseAlways<ExamContext>());
            // Database.SetInitializer(new DropCreateDatabaseIfModelChanges<ExamContext>());
        }

        public ExamContext() : base("name=ExamContext")
        {
        	// 禁用延迟加载
    		this.Configuration.LazyLoadingEnabled = false;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        	// 禁用一对多级联删除
    		modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
    		// 禁用多对多级联删除
    		modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();
    		// 禁用默认表名复数形式
    		modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}
```

在使用 `DbContext` 时，就用到了 `App.config` 文件中配置的 ` connectionStrings`，因为在构造方法中指定了连接字符串 ` ExamContext`。

#### DBContext 数据库初始化方式

Entity Framework 通过 ` Database.SetInitializer` 来指定需要的数据库初始化方式，可指定的数据库一共有三种：

##### ` CreateDatabaseIfNotExist`

` CreateDatabaseIfNotExist` 是初始化数据库的默认方式，用于当数据库不存在时，自动创建数据库。由于该方式是默认的，所以可以不用写代码，当然也可以用代码来指定：

```c#
Database.SetInitializer(new CreateDatabaseIfNotExists<ExamContext>());
```

##### `DropCreateDatabaseWhenModelChanges`

`DropCreateDatabaseWhenModelChanges` 用于当数据模型发生改变时，先删除原数据库，再创建新数据库：

```c#
Database.SetInitializer(new DropCreateDatabaseWhenModelChanges<ExamContext>)();
```

##### `DropCreateDatabaseAlways`

`DropCreateDatabaseAlways` 用于每次创建数据库前，均先删除原有的数据库，无论数据模型是否发生变化：

```c#
Database.SetInitializer(new DropCreateDatabaseAlways<ExamContext>)();
```

然而，更多的时候，我们希望 Entity Framework Code First 在与数据库不匹配时，宁可报出数据库连接错误，而不希望对数据库进行任何的删除创建操作，这时我们可以使用 Entity Framework 提供的关闭数据库初始化操作：

```c#
Database.SetInitializer<ExamContext>(null);
```

我们可以在静态构造方法中设置上述的数据库初始化方式。

#### DbContext 连接数据库的一些设置

在实际使用 Entity Framework Code First 操作数据库时，通常会在继承自 `DbContext` 的类中做一些数据库操作设置。

##### 禁用延迟加载

有的时候我们可能需要禁用延迟加载（LazyLoading），这就需要在代码中设置一下（关于延迟加载的优点和缺点，暂时可以先参考文章 [EF 使用延迟加载的本质原因](https://blog.csdn.net/qq1010885678/article/details/38238265)）：

```c#
public ExamContext() : base("name=ExamContext")
{
    // 禁用延迟加载
    this.Configuration.LazyLoadingEnabled = false;
}
```

##### 禁用关系数据的级联删除

级联删除就是，在存在关联关系的数据表之间，删除主表记录的时候，自动删除从表中关联的记录。但是在实际项目中，我们可能不想使用这种级联删除功能，就算需要删除从表的记录，也是更愿意通过代码来手动删除，以确保安全。禁用级联删除的代码如下：

```c#
protected override void OnModelCreating(DbModelBuilder modelBuilder)
{
    // 禁用一对多级联删除
    modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
    // 禁用多对多级联删除
    modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();
}
```

##### 禁用默认表名复数形式

Entity Framework Code First 在根据类名生成数据表时，生成的数据表的表名，默认是类名的复数形式，可以通过代码禁用：

```c#
protected override void OnModelCreating(DbModelBuilder modelBuilder)
{
    // 禁用默认表名复数形式
    modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
}
```

当然还有其他相关的一些设置项，不一一列举。