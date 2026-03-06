---
title: 使用 Java 实现 ArrayList
slug: "implement-arraylist-in-java"
date: 2018-05-02
lastmod: 2018-05-02
description: "用 Java 手写 ArrayList，梳理动态数组的底层结构、扩容机制与常见操作。"
summary: "用 Java 手写 ArrayList，梳理动态数组的底层结构、扩容机制与常见操作。"
cover:
  image: "/covers/implement-arraylist-in-java.svg"
  alt: "使用 Java 实现 ArrayList 封面"
  relative: false
tags: 
  - 数据结构
  - ArrayList
  - Java
categories: [技术, 工作]
draft: false
---

## ArrayList 基本介绍

ArrayList 是 List 接口中最为常用的一个实现类，从名字可以看出，它与数组有着千丝万缕的关系。实际上，ArrayList 就是在底层维护了一个数组，这个数组不过是动态的、可以随时自动扩容的。往简单了说，ArrayList 就是一个动态数组。理解了这个，也就理解了 ArrayList 的精髓。今天看了源码，然后跟着简单地敲了一下，实现了里面的几个方法，在下面记录一下。

<!-- more -->

## ArrayList 的实现

把 ArrayList 想象成一个数组，像 `add`、`remove`、`get` 以及 `set` 等常用方法闭着眼睛就能敲了，就不赘述代码的步骤了。下面直接上一车，哈哈哈😄

```java
package com.realchoi.arraylist;

/**
 * 手动实现 ArrayList
 *
 * @author realchoi
 */
public class MyArrayList {
    // List 中元素的个数
    private int size;

    // List 中维护的数组（关键就在这）
    private Object[] elementData;

    /**
     * 无参构造方法，初始化 MyArrayList
     */
    public MyArrayList() {
        this(10);
    }

    /**
     * 有参构造方法，初始化 MyArrayList，并给定初始容量
     *
     * @param capacity 初始容量
     */
    public MyArrayList(int capacity) {
        if (capacity < 0) {
            try {
                throw new Exception();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        elementData = new Object[capacity];
    }

    /**
     * 获取 List 中元素的个数
     *
     * @return
     */
    public int size() {
        return size;
    }

    /**
     * 将元素添加到 List 末尾
     *
     * @param element 待添加的元素
     */
    public void add(Object element) {
        // 添加时首先需要判断数组容量是否够用，否则进行扩容
        ensureCapacity();
        elementData[size] = element;
        size++;
    }


    /**
     * 在 List 的指定位置添加元素
     *
     * @param index   添加元素的位置
     * @param element 待添加的元素
     */
    public void add(int index, Object element) {
        // 先判断指定的位置是否越界
        rangeCheck(index);
        // 再扩容
        ensureCapacity();
        // index 位置的数组向后移动一位
        System.arraycopy(elementData, index, elementData, index + 1, size - index);
        elementData[index] = element;
        size++;
    }

    /**
     * 获取 List 指定位置的元素
     *
     * @param index 指定的位置
     * @return
     */
    public Object get(int index) {
        rangeCheck(index);
        return elementData[index];
    }

    /**
     * 移除指定位置的元素
     *
     * @param index 指定的位置
     * @return 移除的元素
     */
    public Object remove(int index) {
        rangeCheck(index);
        Object removedEle = elementData[index];
        elementData[index] = null;
        // index + 1 位置的数组往前移动一位
        System.arraycopy(elementData, index + 1, elementData, index, size - index - 1);
        size--;
        return removedEle;
    }

    /**
     * 删除指定的元素
     *
     * @param element 待删除的元素
     * @return 删除的元素的原位置
     */
    public int remove(Object element) {
        for (int i = 0; i < size; i++) {
            if (elementData[i].equals(element)) {
                // 删除第一个和待删除元素 equals 的元素
                elementData[i] = null;
                System.arraycopy(elementData, i + 1, elementData, i, size - i - 1);
                size--;
                return i;
            }
        }
        return -1;
    }

    /**
     * 设置指定位置的元素
     *
     * @param index   指定的位置
     * @param element 指定的元素
     * @return 原位置的元素
     */
    public Object set(int index, Object element) {
        rangeCheck(index);
        Object oldEle = elementData[index];
        elementData[index] = element;
        return oldEle;
    }

    /**
     * 判断 List 是否为空
     *
     * @return
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 查询 List 中第一个和指定元素匹配的元素的索引
     *
     * @param element 指定的元素
     * @return 元素的索引
     */
    public int indexOf(Object element) {
        // 先判断指定元素为 null 的情况
        if (element == null) {
            for (int i = 0; i < size; i++) {
                if (elementData[i] == null) {
                    return i;
                }
            }
        } else {
            for (int i = 0; i < size; i++) {
                if (elementData[i].equals(element)) {
                    return i;
                }
            }
        }
        // 不存在则返回 -1
        return -1;
    }

    /**
     * 查询 List 中最后一个和指定元素匹配的元素的索引
     *
     * @param element 指定的元素
     * @return 元素的索引
     */
    public int lastIndexOf(Object element) {
        if (element == null) {
            for (int i = size - 1; i >= 0; i--) {
                if (element == null) {
                    return i;
                }
            }
        } else {
            for (int i = size - 1; i >= 0; i--) {
                if (elementData[i].equals(element)) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * 清空 List 中的元素
     */
    public void clear() {
        for (int i = 0; i < size; i++) {
            elementData[i] = null;
        }
        size = 0;
    }

    /**
     * 将 List 转为数组
     *
     * @return
     */
    public Object[] toArray() {
        Object[] array = new Object[size];
        for (int i = 0; i < size; i++) {
            array[i] = elementData[i];
        }
        return array;
    }

    /**
     * 将指定的 List 全部添加到原 List 的末尾
     *
     * @param myArrayList 待添加的 List
     */
    public void addAll(MyArrayList myArrayList) {
        // 扩容
        if (size + myArrayList.size == elementData.length) {
            Object[] newElementData = new Object[(size + myArrayList.size) * 2 + 1];
            System.arraycopy(elementData, 0, newElementData, 0, size);
            elementData = newElementData;
        }
        // 将待添加的 List 转为数组，并复制到原 List 的末尾
        Object[] newArray = myArrayList.toArray();
        System.arraycopy(newArray, 0, elementData, size, newArray.length);
        size = size + newArray.length;
    }

    /**
     * 将指定的 List 添加到原 List 的指定位置
     *
     * @param index       指定的位置
     * @param myArrayList 待添加的 List
     */
    public void addAll(int index, MyArrayList myArrayList) {
        rangeCheck(index);
        // 扩容
        if (size + myArrayList.size == elementData.length) {
            Object[] newElementData = new Object[(size + myArrayList.size) * 2 + 1];
            System.arraycopy(elementData, 0, newElementData, 0, size);
            elementData = newElementData;
        }
        // 原数组从 index 处向后移动，腾出位置插入新元素
        System.arraycopy(elementData, index, elementData, index + myArrayList.size, size - index);
        // 将待添加的 List 转为数组，并复制到原 List 的 index 处
        Object[] newArray = myArrayList.toArray();
        System.arraycopy(newArray, 0, elementData, index, newArray.length);
        size = size + newArray.length;
    }

    /**
     * 对 List 进行扩容
     */
    private void ensureCapacity() {
        if (size == elementData.length) {
            Object[] newElementData = new Object[elementData.length * 2 + 1];
            System.arraycopy(elementData, 0, newElementData, 0, size);
            elementData = newElementData;
        }
    }

    /**
     * 检查指定的位置是否越界
     *
     * @param index 指定的位置
     */
    private void rangeCheck(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
    }
}
```

以上只是简单实现了其中的几个方法，当做学习，不足以表现出 Java 中 ArrayList 类的特性，想理解更多，还需深入学习。

Over~😎