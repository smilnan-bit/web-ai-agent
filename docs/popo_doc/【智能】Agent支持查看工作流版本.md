# 【智能】Agent支持查看工作流版本

> Source: https://docs.popo.netease.com/team/pc/r17pusa6/pageDetail/d4a6b414ba404544b2ce4ed36fa0c398
> Generated: 2026-02-04T11:37:24.214Z

---

## 一、版本规划

在线11.2需求清单

## 二、修订记录

| 版本号 | 修订时间 | 修订内容 | 修订人 |
| --- | --- | --- | --- |
| v1.0 | 2026.01.16 | 创建文档 | 小娥 |

## 三、需求背景

1

-   增加工作流版本功能，支持查看历史发布版本、回溯历史版本、试运行历史版本。

## 四、优秀案例调研

| 厂商 | 相关截图 |
| --- | --- |
| 腾讯云 | 
![](images/d4a6b414-image-0.png)

  |
| coze |  

![](images/d4a6b414-image-1.png)

![](images/d4a6b414-image-2.png)





 |
| dify | 

![](images/d4a6b414-image-3.png)

  |

## 四、需求描述

## 1、查看历史发布版本

入口如下图，在【试运行】按钮左侧，鼠标hover效果：查看历史发布版本

\----没存历史的版本

![](images/d4a6b414-image-4.png)

1.

2.  点击icon，展开【发布记录】看板，同时，右上角从左至右分别展示按钮为：试运行、退出查看；

2.

2.  支持切换历史发布记录进行查看，默认定位在当前版本下

a.

2.  历史版本：展现的是历史【发布版本】，而不是【草稿版本】

b.

2.  当前版本：展现的是当前【草稿版本】

![](images/d4a6b414-image-5.png)

## 2、回溯历史版本

1.

2.  点击【恢复历史版本】后，需要一个二次确认弹窗

a.

2.  弹窗标题：恢复历史版本

b.

2.  小字说明：确定要恢复此版本吗？恢复后，将覆盖当前最新的画布内容，且不可找回，请谨慎选择。

c.

2.  按钮：取消 确定

2.

2.  点击确认后，将立即【选中的历史版本配置内容】覆盖当前的【草稿内容】，仍定位在【当前版本】下

![](images/d4a6b414-image-6.png)

![](images/d4a6b414-image-7.png)

1

-   点击画布中的卡片，仅支持查看，不支持编辑，所有组件需要置灰，具体处理如下：

| 类型 | 截图 | 说明 |
| --- | --- | --- |
| 画布操作栏 | 
![](images/d4a6b414-image-8.png)





 | 1保留内容包括：1触摸屏/鼠标友好1放大缩小1适配屏幕大小1小地图 |
| 开始节点 | 

![](images/d4a6b414-image-9.png)

  | 红色：置灰蓝色：隐藏 |
| 结束节点 | 

![](images/d4a6b414-image-10.png)

  | 红色：置灰蓝色：隐藏 |
| 条件判断 | 

![](images/d4a6b414-image-11.png)

  | 红色：置灰蓝色：隐藏 |
| 代码节点 | 

![](images/d4a6b414-image-12.png)

  | 红色：置灰蓝色：隐藏 |
| 大模型节点 | 

![](images/d4a6b414-image-13.png)

  | 红色：置灰蓝色：隐藏 |
| 工具节点 | 

![](images/d4a6b414-image-14.png)

  | 红色：置灰蓝色：隐藏 |
| 回复节点 | 

![](images/d4a6b414-image-15.png)

![](images/d4a6b414-image-16.png)

![](images/d4a6b414-image-17.png)

  | 红色：置灰蓝色：隐藏 |
| 对话节点 | 

![](images/d4a6b414-image-18.png)

![](images/d4a6b414-image-19.png)

![](images/d4a6b414-image-20.png)

![](images/d4a6b414-image-21.png)

![](images/d4a6b414-image-22.png)

  | 红色：置灰蓝色：隐藏 |
| 知识库 | 

![](images/d4a6b414-image-23.png)

  | 红色：置灰蓝色：隐藏 |
| 文本处理 | 

![](images/d4a6b414-image-24.png)

![](images/d4a6b414-image-25.png)

  | 红色：置灰蓝色：隐藏 |
| 变量聚合 | 

![](images/d4a6b414-image-26.png)

  | 红色：置灰蓝色：隐藏 |
| 全局变量赋值 | 

![](images/d4a6b414-image-27.png)

  | 红色：置灰蓝色：隐藏 |

## 3、试运行历史版本

\--依赖工作流试运行

1

-   点击【试运行】，需要在【发布记录】左侧展开【调试与预览】，进入【工作流试运行的启动页】

1

-   【工作流试运行】的需求详见策划稿：[【智能】Agent支持工作流调试](https://docs.popo.netease.com/team/pc/r17pusa6/pageDetail/ebf7216f3d5f4795b0c79a9900129b37)﻿

![](images/d4a6b414-image-28.png)

![](images/d4a6b414-image-29.png)

## 4、其他

1

-   发现【Agent查看历史版本】，针对【工具-设置】和【工作流-设置】，弹窗内容未置灰，本期需要顺带处理下；

![](images/d4a6b414-image-30.png)