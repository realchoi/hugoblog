---
title: "根据 IQueryable 对象得到其查询的 SQL 语句和参数"
slug: "get-the-sql-statement-and-parameters-according-to-the-iqueryable-object"
tags: [C#, Entity Framework]
categories: [技术]
keywords:
- C#
- Csharp
- C Sharp
- 开发
- developer
- 教程
- tutorial
description: "使用 Entity Framework 查询数据库得到的 IQueryable 对象，怎么得到它实际查询的 SQL 语句？"
summary: "使用 Entity Framework 查询数据库得到的 IQueryable 对象，怎么得到它实际查询的 SQL 语句？"
date: 2023-05-29T13:51:11+08:00
lastmod: 2023-05-29T13:51:11+08:00
draft: false
---

在使用 Entity Framework 作为 ORM 的时候，我们可能会根据得到的某个 IQueryable 查询对象，来“翻译”其最终的执行 SQL 以及传入的参数。经过一番拼凑，我得到了以下的方法，在此记录，便于日后学习和使用。

```c#
/// <summary>
/// 根据 IQueryable 对象，获取其查询数据库的 SQL 语句，以及查询条件的参数值
/// </summary>
/// <param name="queryable">查询对象</param>
/// <param name="ctx">数据库上下文</param>
/// <returns></returns>
public static (string Sql, IReadOnlyDictionary<string, object> Parameters) GetSqlAndParameters(
    this IQueryable queryable, DbContext ctx)
{
    Expression query = queryable.Expression;

    var databaseDependencies = ctx.GetService<DatabaseDependencies>();

    IQueryTranslationPreprocessorFactory _queryTranslationPreprocessorFactory =
        ctx.GetService<IQueryTranslationPreprocessorFactory>();

    IQueryableMethodTranslatingExpressionVisitorFactory _queryableMethodTranslatingExpressionVisitorFactory =
        ctx.GetService<IQueryableMethodTranslatingExpressionVisitorFactory>();

    IQueryTranslationPostprocessorFactory _queryTranslationPostprocessorFactory =
        ctx.GetService<IQueryTranslationPostprocessorFactory>();

    QueryCompilationContext queryCompilationContext =
        databaseDependencies.QueryCompilationContextFactory.Create(true);

    IDiagnosticsLogger<DbLoggerCategory.Query>
        logger = ctx.GetService<IDiagnosticsLogger<DbLoggerCategory.Query>>();

    QueryContext queryContext = ctx.GetService<IQueryContextFactory>().Create();

    QueryCompiler queryCompiler = ctx.GetService<IQueryCompiler>() as QueryCompiler;

    MethodCallExpression methodCallExpr1 =
        queryCompiler.ExtractParameters(query, queryContext, logger, parameterize: true) as MethodCallExpression;

    QueryTranslationPreprocessor queryTranslationPreprocessor =
        _queryTranslationPreprocessorFactory.Create(queryCompilationContext);

    MethodCallExpression methodCallExpr2 =
        queryTranslationPreprocessor.Process(methodCallExpr1) as MethodCallExpression;

    QueryableMethodTranslatingExpressionVisitor queryableMethodTranslatingExpressionVisitor =
        _queryableMethodTranslatingExpressionVisitorFactory.Create(queryCompilationContext);

    ShapedQueryExpression shapedQueryExpression1 =
        queryableMethodTranslatingExpressionVisitor.Visit(methodCallExpr2) as ShapedQueryExpression;

    QueryTranslationPostprocessor queryTranslationPostprocessor =
        _queryTranslationPostprocessorFactory.Create(queryCompilationContext);

    ShapedQueryExpression shapedQueryExpression2 =
        queryTranslationPostprocessor.Process(shapedQueryExpression1) as ShapedQueryExpression;

    IRelationalParameterBasedSqlProcessorFactory _relationalParameterBasedSqlProcessorFactory =
        ctx.GetService<IRelationalParameterBasedSqlProcessorFactory>();

    RelationalParameterBasedSqlProcessor _relationalParameterBasedSqlProcessor =
        _relationalParameterBasedSqlProcessorFactory.Create(true);

    SelectExpression selectExpression = (SelectExpression)shapedQueryExpression2.QueryExpression;

    selectExpression =
        _relationalParameterBasedSqlProcessor.Optimize(selectExpression, queryContext.ParameterValues,
                                                       out bool canCache);

    IQuerySqlGeneratorFactory querySqlGeneratorFactory = ctx.GetService<IQuerySqlGeneratorFactory>();

    QuerySqlGenerator querySqlGenerator = querySqlGeneratorFactory.Create();

    var cmd = querySqlGenerator.GetCommand(selectExpression);
    var parametersDict = queryContext.ParameterValues;
    var sql = cmd.CommandText;
    return (sql, parametersDict);
}
```

