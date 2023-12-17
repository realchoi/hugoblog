---
title: "在 Asp.Net Core WebApi 中全局捕获异常"
slug: "catching-exceptions-globally-in-dotnetcore-webapi"
tags: [dotNET, dotNET Core, WebApi]
categories: [技术]
date: 2022-11-15T21:54:08+08:00
lastmod: 2022-11-15T21:54:08+08:00
draft: false
---

### 为什么需要写日志

不管是写接口，还是写 MVC 程序，我们都必须对程序中的每个异常做记录，这样才能知道哪里发生了错误，以便更好地改进代码。拿 Asp.Net Core WebApi 接口项目来说，最笨的方法，就是在每个 Action 的主要逻辑中加上 `try catch` 代码块来捕获异常，然后写对应的日志，但这不是一个合格的程序员做得出来的事情——那么多的接口，若每个都加 `try catch` 代码块，简直会疯。好在 .net core 有对应的方法来简化这些逻辑。



### 如何优雅地写日志

> **总则：与业务代码低耦合。**

写日志本身，并不属于业务的一部分，因此我们在写日志时，不应该与主要业务逻辑代码强耦合，这也是上面举例中不合适的一个原因。




### 捕获 Action 执行异常

对于 Action 执行的异常，一般有两种常用方式：分别使用**中间件**和**过滤器**。

下图是官方用来解释过滤器在 HTTP 请求管道中的位置，可以看到过滤器是在中间件执行之后才会到达。

![](https://s3.bmp.ovh/imgs/2022/11/15/97efaf0c3dd51e43.png)

当然，过滤器也不只一种，而是由很多种，下面是从网上找来的一张表示过滤器执行顺序的图片：

![](https://s3.bmp.ovh/imgs/2022/11/15/3d78155dcadd1cd1.jpg)

现在来看一下这两种方法怎么实现。

#### 使用中间件（Middleware）

在 .net core 中，请求管道就是由一系列的中间件组成，我们可以在其中任何一个节点，使用自定义的中间件，来拦截请求。每个中间件中，都有一个 **`Invoke`** 方法，该方法接收一个请求上下文对象 `HttpContext` 的参数，在该方法中，我们可以自定义对请求的处理逻辑。另外还有一个 **`RequestDelegate`** 类型的委托 `next`，该委托指向下一步中间件，在当前中间件执行完成后，不要忘记调用 `next()` 委托，此时管道会流转到下一步中间件中，如果这里没有调用 `next()`，整个请求将会被短路。

我们注册一个名为 `ErrorHandlingMiddleware` 的类，按照上面的说明，在类中声明一个 **`Invoke`** 方法，以及一个 **`RequestDelegate`** 类型的委托 `next`。

``` csharp
/// <summary>
/// 异常处理中间件
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    /// <summary>
    /// 构造方法
    /// </summary>
    /// <param name="next">调用下一步中间件的委托</param>
    /// <param name="logger">日志对象</param>
    /// <param name="env">程序环境</param>
    public ErrorHandlingMiddleware(RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// 执行当前中间件
    /// </summary>
    /// <param name="context"></param>
    /// <returns></returns>
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary>
    /// 异常处理
    /// </summary>
    /// <param name="context"></param>
    /// <param name="exception"></param>
    /// <returns></returns>
    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // 记录日志
        _logger.LogError(new EventId(0), exception, exception.Message);
        _logger.LogDebug(exception.StackTrace);
        context.Response.ContentType = "application/json";

        var serializerSetting = new JsonSerializerSettings
        {
            // 首字母小写
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        if (exception is ApiBaseException apiException)
        {
            context.Response.StatusCode = (int)apiException.HttpCode;

            return context.Response.WriteAsync(JsonConvert.SerializeObject(new ErrorOutput
            {
                Code = apiException.ErrorCode,
                Status = apiException.Status,
                Message = apiException.Message,
                Details = apiException?.Details
            }, serializerSetting));
        }
        else
        {
            context.Response.StatusCode = 500;
            return context.Response.WriteAsync(JsonConvert.SerializeObject(new ErrorOutput
            {
                Code = InternalErrorCode.InternalServerError,
                Status = "INTERNAL_SERVER_ERROR",
                Message = _env.IsDevelopment() ? exception.GetBaseException().Message : "Internal server error, please contact websites maintainer.",
                Details = _env.IsDevelopment()
                ? new List<string> { exception.StackTrace }
                : null
            }, serializerSetting));
        }
    }
}
```

然后在 `Startup` 类的 `Configure` 方法中，使用该中间件：

```csharp
public void Configure(IApplicationBuilder app)
{
    // 其他中间件...
    // ...
    // 使用自定义异常处理中间件
    app.UseMiddleware<ErrorHandlingMiddleware>();
}
```

当然也可以自定义一个扩展方法，然后像使用原生中间件一样使用自定义中间件，形如：`app.UseMyErrorHandling();`，这里就不展开。

#### 使用异常过滤器（ExceptionFilterAttribute）

过滤器其实是**面向切面编程**（Aspect Oriented Programming，AOP）的一种实现方式。它也是在请求发生时，对请求进行拦截，感官上和中间件的作用类似，可以看作是功能精细化后的一个中间件（即专门用来处理请求异常）。我们自定义一个名为 `ErrorHandlingFilterAttribute ` 的类，它必须继承官方的 `ExceptionFilterAttribute` 类，然后重写 `OnException` 方法，在 `OnException` 方法中来实现我们对异常的处理逻辑即可。

```csharp
/// <summary>
/// 异常处理过滤器
/// </summary>
public class ErrorHandlingFilterAttribute : ExceptionFilterAttribute
{
    private readonly ILogger<ErrorHandlingFilterAttribute> _logger;
    private readonly IWebHostEnvironment _webHostEnvironment;

    /// <summary>
    /// 构造方法
    /// </summary>
    /// <param name="logger">日志对象</param>
    /// <param name="webHostEnvironment">程序使用环境</param>
    public ErrorHandlingFilterAttribute(ILogger<ErrorHandlingFilterAttribute> logger,
        IWebHostEnvironment webHostEnvironment)
    {
        _logger = logger;
        _webHostEnvironment = webHostEnvironment;
    }

    /// <summary>
    /// 异常发生时
    /// </summary>
    /// <param name="context"></param>
    public override void OnException(ExceptionContext context)
    {
        // 记录日志
        _logger.LogError(new EventId(0), context.Exception, context.Exception.ToString());

        // 将请求上下文中的异常是否已处理置为 true
        context.ExceptionHandled = true;

        // 自定义异常基类
        if (context.Exception is ApiBaseException exception)
        {
            context.HttpContext.Response.StatusCode = (int)exception.HttpCode;
            context.Result = new JsonResult(new ErrorOutput()
            {
                Code = exception.ErrorCode,
                Status = exception.Status,
                Message = exception.Message,
                Details = exception?.Details
            });
        }
        else
        {
            context.HttpContext.Response.StatusCode = 500;
            context.Result = new JsonResult(new ErrorOutput()
            {
                Code = InternalErrorCode.InternalServerError,
                Status = "INTERNAL_SERVER_ERROR",
                Message = context.Exception.GetBaseException().Message,
                Details = _webHostEnvironment.IsDevelopment()
                ? new List<string>() { context.Exception.StackTrace }
                : null
            });
        }
    }
}
```

然后需要在 `Startup` 类的 `ConfigureServices` 方法中，使用该过滤器。

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // 其他服务...
    // ...
    // 使用自定义异常处理过滤器
    services.AddMvc(options =>
    {
        options.Filters.Add(typeof(ErrorHandlingFilterAttribute));
    });
}
```



### 捕获模型绑定异常

上面说的都是捕获 Action 执行时发生的异常，通过前面的过滤器执行顺序图可以看到，在 ActionFilter 过滤器之前，还有一个模型绑定阶段。很多时候，在模型绑定阶段就因为参数无法解析而早已经发生异常，这里的异常我们又该如何全局捕获并记录日志呢？这就需要使用到 `ApiBehaviorOptions` 配置了。

我们定义一个扩展方法，用来配置 `ApiBehaviorOptions`：

```csharp
public static class ModelBindingExceptionHandlingExtension
{
    /// <summary>
    /// 配置模型绑定异常捕获
    /// </summary>
    /// <param name="services">服务容器</param>
    public static void ConfigureModelBindingExceptionHandling(this IServiceCollection services)
    {
        services.Configure<ApiBehaviorOptions>(options =>
        {
            // 每次请求时，如果发生了入参解析失败的情况，则会调用此处逻辑
            options.InvalidModelStateResponseFactory = actionContext =>
            {
                var error = actionContext.ModelState?.FirstOrDefault(e => e.Value.Errors.Count > 0).Value;
                // 记录日志
                var loger = services.BuildServiceProvider().GetRequiredService<ILogger<StartupModule>>();
                loger.LogError(new EventId(0), error?.Errors.First().Exception, $"入参解析失败：{error?.Errors.First().ErrorMessage}");
                loger.LogDebug($"入参解析失败：{error?.Errors.First().ErrorMessage}");
                
                var errorOutput = new ErrorOutput
                {
                    Code = Api.Exceptions.Contracts.InternalErrorCode.InternalServerError,
                    Status = "服务器内部异常",
                    Message = $"入参解析失败：{error?.Errors.First().ErrorMessage}",
                    Details = error?.Errors.First().Exception?.ToString()
                };
				// 返回自定义异常信息
                return new BadRequestObjectResult(errorOutput);
            };
        });
    }
}
```

然后需要在 `Startup` 类的 `ConfigureServices` 方法中，使用该配置。

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // 其他服务...
    // ...
    // 配置模型绑定异常处理
    services.ConfigureModelBindingExceptionHandling();
}
```



### 参考文档

感谢以下两篇博客及其作者：

- [NetCore实现全局模型绑定异常信息统一处理](https://blog.csdn.net/qq_34623557/article/details/122181912)
- [理解ASP.NET Core - 过滤器(Filters)](https://www.cnblogs.com/xiaoxiaotank/p/15622083.html)
