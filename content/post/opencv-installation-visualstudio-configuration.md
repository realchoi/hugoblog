---
title: "OpenCV 的安装与 Visual Studio 环境的配置"
slug: "opencv-installation-visualstudio-configuration"
tags: 
  - OpenCV
  - Visual Studio
date: 2017-05-06
categories: [技术]
draft: false
---
## 前言

大学四年很快就结束了，前面玩了三年六个月，最后六个月，怎么说也得学点点点点点东西吧...

额，我说的就是毕业设计（笑）。

很幸运，我选到一位很喜欢的老师做我的导师，他给我出的题目也相对不错，所以我在做的时候，也 “相对” 比较用心。

课题需要用到 OpenCV 和 Visual Studio ，所以这里记录一下在 Visual Studio 里配置 OpenCV 的相关方法。

## 下载和安装 OpenCV SDK

进行这个步骤之前，默认你已经安装了 Visual Studio（我安装的是 Visual Studio 2012 ）。

打开 OpenCV 官方的下载地址：<http://opencv.org/releases.html>，选择对应的版本即可直接下载。下载完成后，直接双击文件，会提示解压到某个地方，比如 D:\opencv249 ，然后点击 Extract 按钮。稍候几分钟，在 D:\opencv249 下就会得到一个 opencv 文件夹，里面就是 OpenCV 的各种文件了。

![](https://ws1.sinaimg.cn/large/df837310gy1ffby718pfaj20pq06kdgo.jpg)
<br>
## 配置环境变量

配置步骤如下：

右击【计算机】→【属性】→【高级系统设置】→【环境变量】→双击【系统变量】中的【Path】→【新建】，将相应的路径添加进去。

对于32位系统，添加路径："…opencv\build\x86\vc10\bin"；

对于64位系统，添加路径："…opencv\build\x86\vc10\bin"、"…opencv\build\x64\vc10\bin"。

步骤图示：

【1】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbysno8n1j20ag0br4hk.jpg)

【2】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbytmvensj20qa0ga3zw.jpg)

【3】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbytvfge4j20db0gmdg8.jpg)

【4】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbyu7q9l1j20h60ibq3p.jpg)

【5】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbyuh24uqj20en0fn0ta.jpg)
<br>
## 工程包含目录（include）的配置

打开 Visual Studio ，【新建】→【项目】→【Visual C++】→【Win32控制台应用程序】（此时在下面给项目命名，比如“Test”）→【确定】→【下一步】→把【空项目】打上勾（此时项目建立完成）→【视图】→【其他窗口】→【属性管理器】→双击【Microsoft.Cpp.Win32.user】→【VC++目录】→【包含目录】，在这里添加上以下三个目录：

"...opencv\build\include"

"...opencv\build\include\opencv"

"...opencv\build\include\opencv2"

步骤图示：

【1】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbzh7tp9oj20q50fzabf.jpg)

【2】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbzhk1bshj20ij0dgq33.jpg)

【3】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbzhtlqcdj20ij0dg0sz.jpg)

【4】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbzi20abtj211y0lc42d.jpg)

【5】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbziagkmfj211y0kgdh9.jpg)

【6】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbziil12vj20oe0ghjsi.jpg)

【7】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbziqplcpj20bq0b23yn.jpg)
<br>

## 工程库（lib）目录的配置

接 3.6 步，在库目录中添加以下目录：

"...opencv\build\x86\vc11\lib"

（这里到底是选择 x86 还是 x64 ，取决于你编译时选择的是 Win32 还是 x64 ，但是一般情况下，我们用的都是 Win32 的 x86 编译器，因此建议选择 x86 。）

步骤图示：

......

【6】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbzsa7yu0j20oe0gh0tu.jpg)

【7】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbzsnwbpnj20bq0b2aa6.jpg)
<br>
## 链接库的配置

依然是“属性管理器”工作区中，双击（或者右键属性）【Microsoft.Cpp.Win32.user】→【通用属性】 →【链接器】→【输入】→【附加的依赖项】

![](https://ws1.sinaimg.cn/large/df837310gy1ffbzxliyazj20oe0gh758.jpg)

对于【OpenCV2.4.9】，添加如下 249 版本的 lib（这样的 lib 顺序是：19个带 ``d`` 的 debug 版的 lib 写在前面，19 个不带 ``d`` 的 release 版的 lib 写在后面）：

opencv_ml249d.lib
opencv_calib3d249d.lib
opencv_contrib249d.lib
opencv_core249d.lib
opencv_features2d249d.lib
opencv_flann249d.lib
opencv_gpu249d.lib
opencv_highgui249d.lib
opencv_imgproc249d.lib
opencv_legacy249d.lib
opencv_objdetect249d.lib
opencv_ts249d.lib
opencv_video249d.lib
opencv_nonfree249d.lib
opencv_ocl249d.lib
opencv_photo249d.lib
opencv_stitching249d.lib
opencv_superres249d.lib
opencv_videostab249d.lib

opencv_objdetect249.lib
opencv_ts249.lib
opencv_video249.lib
opencv_nonfree249.lib
opencv_ocl249.lib
opencv_photo249.lib
opencv_stitching249.lib
opencv_superres249.lib
opencv_videostab249.lib
opencv_calib3d249.lib
opencv_contrib249.lib
opencv_core249.lib
opencv_features2d249.lib
opencv_flann249.lib
opencv_gpu249.lib
opencv_highgui249.lib
opencv_imgproc249.lib
opencv_legacy249.lib
opencv_ml249.lib

![](https://ws1.sinaimg.cn/large/df837310gy1ffc019g5dqj20bq0dc74h.jpg)


对于【OpenCV 3.0】，添加 3.0 版本的 lib ，新版的 lib 非常简单。想用 debug 版本的库，添加 opencv_ts300d.lib 和  opencv_world300d.lib 即可。

而想用 release 版本的库，添加

opencv_ts300.lib 和 opencv_world300.lib 即可。

其实，对已经发行和未来即将发布的新版 OpenCV ，只需看 opencv\build\x86\vc10\lib 下的库是哪几个，添加成依赖项就可以了。
<br>
## 测试

点击【解决方案资源管理器】→右击【源文件】→【添加】→【新建项】→【Visual C++】→【C++文件（.cpp）】（此时给文件命名，比如main.cpp）→【添加】，把以下代码复制到该文件中。

```c++
#include <iostream>  
#include <opencv2/core/core.hpp>  
#include <opencv2/highgui/highgui.hpp>  

using namespace cv;  

int main()  
{  
    // 读入一张图片（测试）  
    Mat img=imread("pic.jpg");  
    // 创建一个名为"测试"窗口  
    namedWindow("测试");  
    // 在窗口中显示测试图片  
    imshow("测试",img);  
    // 等待6000ms后窗口自动关闭  
    waitKey(6000);  
}  
```

放置一张名为 "pic.jpg" 的图片到工程目录中，然后点击“运行“按钮，如果配置成功，就不会报错，得到预想的运行结果：弹出窗口，显示 "pic.jpg" 图片。
<br>

## 版权声明

本文参考 CSDN 博客撰写，原文链接：<http://blog.csdn.net/poem_qianmo/article/details/19809337>。

## 识别程序

最后附上自己做的一个简单的手写英文字母识别程序的Github地址：<https://github.com/realchoi/CharacterRecognition>