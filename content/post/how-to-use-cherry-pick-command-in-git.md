---
title: "git 中的 cherry-pick 命令的使用方法"
slug: "how-to-use-cherry-pick-command-in-git"
tags: [git]
categories: [技术]
date: 2023-07-17T14:51:56+08:00
lastmod: 2023-07-17T14:51:56+08:00
draft: false
---

`git cherry-pick` 命令用于将一个或多个提交从一个分支复制到另一个分支。

假设现在有一个使用场景：我们只想要在一大堆提交中，将其中一个提交从某个分支复制到 `master` 分支。

以下是使用 `git cherry-pick` 命令的步骤。

- 确定要复制的提交的哈希值。可以使用 `git log` 命令来查看分支历史记录，并找到要复制的提交的哈希值。假设此次要复制的提交的哈希值是 `abc123`。

- 在本地切换到 `master` 分支。可以使用 `git checkout` 命令来切换到 `master` 分支：

  ```bash
  git checkout master
  ```

- 运行 `git cherry-pick` 命令，指定要复制的提交的哈希值：

  ```bash
  git cherry-pick abc123
  ```

  这将在 `master` 分支中创建一个新的提交，该提交包含与 `abc123` 提交相同的更改。

- 如果在复制提交时发生冲突，则需要手动解决冲突。在这种情况下，我们需要编辑冲突文件并手动解决冲突。一旦解决了冲突并编辑了文件，可以使用以下命令将更改标记为已解决：

  ```bash
  git add <file>
  ```

- 我们可以重复运行 `git cherry-pick` 命令，直到所有提交都被复制到 `master` 分支中。

- 当然，如果要复制多个提交，则可以指定一个提交范围，例如：

  ```bash
  git cherry-pick abc123..def456
  ```

  这将复制从 `abc123` 到 `def456` 之间的所有提交（不包括 `abc123`）。

- 使用上面的命令，提交 `abc123` 将不会包含在 cherry pick 中。如果要包含提交 `abc123`，可以使用下面的语法：

  ```bash
  git cherry-pick abc123^..def456
  ```

- 当完成复制提交后，可以使用 `git log` 命令来查看 `master` 分支上的提交历史记录，以确保成功地复制了所需的提交。