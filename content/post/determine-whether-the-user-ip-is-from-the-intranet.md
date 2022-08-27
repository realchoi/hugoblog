---
title: 根据 IP 判断访问页面的用户是否来自内网
slug: "determine-whether-the-user-ip-is-from-the-intranet"
date: 2017-11-30
tags: 
  - IP
  - 局域网
  - C#
categories: [技术, 工作]
draft: false
---

## 前言

最近做项目时遇到一个需求：判断当前访问的用户，和服务器是否在同一个内网中，然后进行不同的跳转。说白了，就是先获取用户的 IP ，然后判断其是否属于内网 IP 。由于项目的语言是 C# ，所以这里我也是用 C# 进行记录。

## 方法

### 获取用户的 IP 地址

简单的来说，有两种方法可以获取到用户的IP，分别是 `remote_addr` 和 `x_forwarded_for` ，这两者区别如下`[1]`：

* `remote_addr` ：代表客户端的IP，但是它的值不是由客户端提供的，而是服务端根据客户端的 IP 指定的，当你的浏览器访问某个网站时，假设中间没有任何代理，那么网站的 Web 服务器（Nginx，Apache 等）就会把 `remote_addr` 设为你的机器 IP ；如果你使用了代理，那么你的浏览器会新访问这个代理，然后再由这个代理转发到网站，这样 Web 服务器就会把 `remote_addr` 设为这台代理机器的 IP 。

  通过 `remote_addr` 获取 IP 的代码如下：

  ```c#
  string ip = HttpContext.Current.Request.ServerVariables["remote_addr"];
  ```

* `x_forwarded_for` ：正如上面所述，当你使用了代理时，Web 服务器就不知道你的真实 IP 了，为了避免这个情况，代理服务器通常会增加一个叫做 `x_forwarded_for` 的头信息，把连接它的客户端 IP（即你的上网机器 IP ）加到这个头信息里，这样就能保证网站的 Web 服务器能获取到真实 IP 。

  通过 `x_forwarded_for` 获取 IP 的代码如下：

  ```c#
  string ip = HttpContext.Current.Request.ServerVariables["x_forwarded_for"];
  ```

由于我们的用户提出这个功能，目的是供自己内部人员使用，并不存在伪造等各种复杂的情况，因此这里使用上述两种方法即可完成预期功能：

* 先直接通过 `x_forwarded_for` 方式获取IP，以防止偶尔有人员挂上了代理。
* 判断通过上述方法获取的 IP 是否为空，如果不为空（用户刚好使用了代理），则获取的 IP 即为用户的 IP ；如果为空（用户没有使用代理），则再使用 `remote_addr` 获取的 IP 作为用户的 IP 。

至此，用户的 IP 我们已经拿到了。

### 判断用户的 IP 是否来自内网

内网（私有 IP ）有三类：

* A 类：10.0.0.0 - 10.255.255.255
* B 类：172.16.0.0 - 172.31.255.255
* C 类：192.168.0.0 - 192.168.255.255
* 最后还有一个回环 IP 地址：127.0.0.1

搞明白这个，也就容易了，即判断用户 IP 是否属于上述四类 IP 的范围即可。

## 代码

详细代码贴在下面：

```c#
/// <summary>
/// 获取真实IP地址
/// </summary>
/// <returns>获取的用户IP</returns>
private static string GetIp()
{
  	//直接获取使用代理情况下的IP
	string ip = HttpContext.Current.Request.ServerVariables["http_x_forwarded_for"];
  	
  	//如果上面获取的IP为空（即用户未使用代理），则直接获取客户端IP
	if (String.IsNullOrEmpty(ip)) 
		ip = HttpContext.Current.Request.ServerVariables["remote_addr"];
	else
	{
		//代理ip地址有内容，判断是否符合IPv4地址或者是否为内网地址
		ip = ip.Trim().Replace(" ", "");
		if (!Regex.IsMatch(ip, @"^\d+(\.\d+){3}$") || IsInnerIp(ip))
        
		//不符合规则或者内网，私有地址使用remote_addr代替
		ip = HttpContext.Current.Request.ServerVariables["remote_addr"];
	}
	return ip;
}

/// <summary>
/// 判断IP地址是否为内网IP地址
/// </summary>
/// <param name="ipAddress">IP地址字符串</param>
/// <returns>是否是内网</returns>
private static bool IsInnerIp(String ipAddress)
{
	long ipNum = GetIpNum(ipAddress);
	long aBegin = GetIpNum("10.0.0.0");
	long aEnd = GetIpNum("10.255.255.255");
	long bBegin = GetIpNum("172.16.0.0");
	long bEnd = GetIpNum("172.31.255.255");
	long cBegin = GetIpNum("192.168.0.0");
	long cEnd = GetIpNum("192.168.255.255");
	bool isInnerIp = IsInner(ipNum, aBegin, aEnd) || IsInner(ipNum, bBegin, bEnd) || IsInner(ipNum, cBegin, cEnd) || ipAddress.Equals("127.0.0.1");
	return isInnerIp;
}

/// <summary>
/// 判断用户IP地址转换为long类型后是否在内网IP地址所在范围
/// </summary>
/// <param name="userIp">获得的用户IP</param>
/// <param name="begin">内网IP开始</param>
/// <param name="end">内网IP结束</param>
/// <returns>用户IP是否在内网IP范围内</returns>
private static bool IsInner(long userIp, long begin, long end)
{
	return userIp >= begin && userIp <= end;
}

/// <summary>
/// 把IP地址转换为long类型数字
/// </summary>
/// <param name="ipAddress">IP地址字符串</param>
/// <returns>IP转换为long类型的数字</returns>
private static long GetIpNum(String ipAddress)
{
	String[] ip = ipAddress.Split('.');
	long a = int.Parse(ip[0]);
	long b = int.Parse(ip[1]);
	long c = int.Parse(ip[2]);
	long d = int.Parse(ip[3]);
	long ipNum = a * 256 * 256 * 256 + b * 256 * 256 + c * 256 + d;
	return ipNum;
}
```

## 参考资料

```[1]``` [怎样正确设置 remote_addr 和 x_forwarded_for](http://blog.csdn.net/smilefyx/article/details/52120461)