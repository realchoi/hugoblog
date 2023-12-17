---
title: "在 C# 中自定义动态对象比较器"
slug: "custom-dynamic-object-comparator-in-csharp"
tags: [C#]
categories: [技术]
date: 2023-06-09T14:34:44+08:00
lastmod: 2023-06-09T14:34:44+08:00
draft: false
---

有时我们在对两个相同类型的对象进行比较、或对两个相同泛型的集合进行去重等操作时，需要对对象的某几个字段进行比较，而不是全部字段。这就需要用到自定义比较器。



### 自定义比较器

通过询问 ChatGPT，它给了我如下方法：

```c#
/// <summary>
/// 自定义比较器
/// </summary>
/// <typeparam name="T">比较的类型</typeparam>
public class ComparerHelper<T> : IEqualityComparer<T>
{
    private readonly Func<T, IEnumerable<object>> _keyExtractor;

    /// <summary>
    /// 创建比较器对象
    /// </summary>
    /// <param name="keyExtractor">需要用来比较的字段</param>
    public ComparerHelper(Func<T, IEnumerable<object>> keyExtractor)
    {
        this._keyExtractor = keyExtractor;
    }

    public bool Equals(T x, T y)
    {
        var xKeys = _keyExtractor(x).ToArray();
        var yKeys = _keyExtractor(y).ToArray();

        if (xKeys.Length != yKeys.Length)
        {
            return false;
        }

        for (int i = 0; i < xKeys.Length; i++)
        {
            if (!xKeys[i].Equals(yKeys[i]))
            {
                return false;
            }
        }

        return true;
    }

    public int GetHashCode(T obj)
    {
        var keys = _keyExtractor(obj).ToArray();

        unchecked
        {
            int hash = 17;
            foreach (var key in keys)
            {
                hash = hash * 23 + (key?.GetHashCode() ?? 0);
            }

            return hash;
        }
    }
}
```



### 使用方法

具体使用如下（对 `RootVarPropValue` 类的两个集合进行取差集，且只考虑其 `NameEn` 字段是否相等）：

```c#
var addedPropValues = newPropValues
            .Except(oldPropValues, new ComparerHelper<RootVarPropValue>(x => new object[] { x.NameEn }))
            .ToList();
```

