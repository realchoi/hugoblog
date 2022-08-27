---
title: 使用 Java 实现单向链表
slug: "implement-single-linkedlist-in-java"
date: 2018-04-10
tags: 
  - 数据结构
  - 链表
  - Java
categories: [技术, 工作]
draft: false
---

## 单向链表基本介绍

链表（Linked List）是一种常见的基础数据结构，是一种线性表，但是并不会按线性的顺序存储数据，实际上它是由节点（Node）组成，一个链表拥有不定数量的节点。其数据的存储位置不是连续的，而是分散在内存中，只有每个节点知道它下一个节点的存储位置。

链表中最常见的一种是单向链表，它包含两个域，一个信息域和一个指针域。这个链接指向列表中的下一个节点，而最后一个节点则指向一个空值。一个单向链表对的节点被分成两个部分，第一个部分保存或者显示关于节点的信息，第二个部分存储下一个节点的地址。单向链表只可向一个方向遍历。

![single-linkedlist.png](https://i.loli.net/2018/04/20/5ad99f730a56e.png)

<p align="center">单向链表图示 1 </p>

![single-linkedlist2.png](https://i.loli.net/2018/04/20/5ad9a0d1c887c.png)

<p align="center">单向链表图示 2 </p>

<!-- more -->

## 单向链表的实现

Java 中 LinkedList 的实现原理就是链表，这里我用 Java 语言手动实现一个简单的单向链表。代码如下。

```java
package com.realchoi.linkedlist;

/**
 * 手动实现链表
 * 
 * @author realchoi
 *
 */
public class MyLinkedlist {
	// 头节点
	Node head = null;

	/**
	 * 链表中的节点 ，data代表节点的对象，next代表指向的下一个节点
	 * 
	 * @author realchoi
	 *
	 */
	class Node {
		// 节点的引用，指向下一个节点
		Node next = null;
		// 节点的对象，即内容
		int data;

		// 构造方法
		public Node(int data) {
			this.data = data;
		}
	}

	/**
	 * 向链表中插入数据（尾部插入）
	 * 
	 * @param data
	 */
	public void addNodeAtLast(int data) {
		// 实例化一个节点
		Node newNode = new Node(data);

		// 如果头节点为空，则将新建的节点设置为头节点
		if (head == null) {
			head = newNode;
			return;
		}
		// 如果头节点不为空，则循环遍历已有的链表，找到链表的尾部
		Node temp = head;
		while (temp.next != null) {
			temp = temp.next;
		}
		// 将新的节点加在链表的尾部
		temp.next = newNode;
	}

	/**
	 * 向链表中插入数据（头部插入）
	 * 
	 * @param data
	 */
	public void addNodeAtFirst(int data) {
		// 实例化一个节点
		Node newNode = new Node(data);

		// 如果头节点为空，则将新建的节点设置为头节点
		if (head == null) {
			head = newNode;
			return;
		}

		// 如果头节点不为空，则将原头节点直接连接到新节点的next，并将新增的节点设为新的头节点
		newNode.next = head;
		head = newNode;
	}

	/**
	 * 删除第index个节点（序号从1开始）
	 * 
	 * @param index
	 * @return
	 */
	public boolean deleteNode(int index) {
		if ((index < 1) || (index > length())) {
			return false;
		}
		if (index == 1) {
			head = head.next;
			return true;
		}
		int i = 2;
		Node preNode = head;
		Node curNode = head.next;
		while (curNode != null) {
			if (i == index) {
				preNode.next = curNode.next;
				return true;
			}
			preNode = curNode;
			curNode = curNode.next;
			i++;
		}
		return false;
	}

	/**
	 * 获取链表的长度
	 * 
	 * @return
	 */
	public int length() {
		int length = 0;
		Node temp = head;
		while (temp.next != null) {
			length++;
			temp = temp.next;
		}
		return length;
	}

	/**
	 * 打印链表的内容
	 */
	public void printLinkedList() {
		Node temp = head;
		while (temp != null) {
			System.out.print(temp.data + " ");
			temp = temp.next;
		}
		System.out.println();
	}
}
```

## 单向链表的反转

### 迭代反转法

迭代反转法是从前往后反转各个节点的指针域的指向。其基本思路是，将当前节点（` curNode`）的下一个节点（` curNode.next`）存储到临时节点（` tempNode`）中，以免后续反转当前节点的指针域时把下一个节点给弄丢了，然后把当前节点的指针域的指向设置为上一个节点（` preNode`）。原理图如下。

![reversebyiteration.png](https://i.loli.net/2018/04/20/5ad9a50edd05f.png)

代码如下。

```java
	/**
	 * 链表反转（使用迭代的方法）
	 * 
	 * @param head
	 *            头节点
	 * @return 反转后的节点
	 */
	public static Node reverseByIteration(Node head) {
		if (head == null || head.next == null) {
			return head;
		}

		// 上一节点
		Node preNode = head;
		// 当前节点
		Node curNode = head.next;
		// 临时节点，用于保存当前节点指向的下一节点
		Node tempNode;

		// 当前节点为null时意味着位于尾节点
		while (curNode != null) {
			// 临时存储下一个节点，否则下一步操作后会把原来的下一个节点丢失
			tempNode = curNode.next;
			// 将当前节点的指针域反转指向上一个节点
			curNode.next = preNode;

			// 指针向后移动
			preNode = curNode;
			curNode = tempNode;
		}
		// 最后将头节点的指针域设为null
		head.next = null;
		// 返回新的头节点（原链表的尾节点）
		return preNode;
	}
```



### 递归反转法

和迭代反转法相反，递归反转法，是利用递归，找到链表的尾节点，然后从尾节点开始反转各个节点的指针域。如下图所示。

![reversebyrecursion.png](https://i.loli.net/2018/04/20/5ad9bb48e73bf.png)

实现代码如下。

```java
	/**
	 * 链表反转（使用递归方法）
	 * 
	 * @param head
	 *            头节点
	 * @return 反转后的节点
	 */
	public static Node reverseByRecursion(Node head) {
		// 若当前链表为空，或者当前节点已经在尾节点，直接返回当前节点
		if (head == null || head.next == null) {
			return head;
		}

		// 先找到后续节点，从后往前进行反转
		Node newHead = ReverseByRecursion(head.next);
		// 将当前节点的指针域指向上一个节点
		head.next.next = head;
		// 上一个节点的指针域设为null
		head.next = null;

		// 返回新的头节点
		return newHead;
	}
```



## 参考资料

` [1]`[维基百科：链表](https://zh.wikipedia.org/wiki/%E9%93%BE%E8%A1%A8)

` [2]`[【数据结构】链表的原理及 Java 实现](https://blog.csdn.net/jianyuerensheng/article/details/51200274)

` [3]`[Java 单链表反转详细过程](https://blog.csdn.net/guyuealian/article/details/51119499)