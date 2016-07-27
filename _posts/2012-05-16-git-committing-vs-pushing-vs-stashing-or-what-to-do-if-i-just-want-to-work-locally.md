---
layout: post
title: 'Git: Committing vs Pushing vs Stashing - OR: "what to do if I just want to
  work locally"'
date: 2012-05-16 07:53:55.000000000 +03:00
type: post
published: true
status: publish
categories:
- VCS
tags:
- git
meta:
  _edit_last: '5'
author:
  login: shaiy@wix.com
  email: shaiy@wix.com
  display_name: Shai Yallin
  first_name: Shai
  last_name: Yallin
---
Many people ask me for advice when they're trying to modify some code locally without the changes finding their way into the remote repository or - gods forbid - the production. This makes me realize that there's some gap in understanding what Git is and how it works.


When you perform a 'git clone ', what you're saying is "I'd like to make some contribution to the project at the remote repository" (or fork it, but that's another use case that doesn't really interest most of you so we'll ignore it). Git copies the remote repository to your local machine, and marking your copy as a **remote tracking branch** of the repository you cloned from.

After your changes have reached some point when they form a meaningful, atomic change to the system, you commit them into your local repository using 'git commit'. By that, you're saying "Gee, this looks like a good idea, I'd like to contribute it back to the project. I don't know when exactly I'll physically send my copy back to the original repository but I **definitely want it to get there**". Then, at some point, you send your changes to the remote repository using 'git push', thereby saying "I have reached a point in time where the original project needs / could use my work, so let's send it there now". In most cases, before you can do that you'll have to update your local copy with the changes that occurred in the remote repository since your clone / since the last time you updated. You do that by using 'git pull' (or 'git pull --rebase', if you prefer, like me, using rebase rather than merge). After merging/rebasing your local repository against its remote counterpart, you can push your changes, making the product guys happy that your change is finally available for testing / deployment.

All that is jolly fun, but what if you want to make some **temporary, local changes** that you **never want to merge with the remote repository**. If you're working on a new file, you can just add it to your local .gitignore file, making Git ignore this file for all eternity. But if you're just modifying some pre-existing file, you're out of luck - you'll just have to edit the file and remember **never to commit it**. Which is fine, until you have to pull changes from the remote repository, whereupon Git explodes telling you that you have some uncommitted / untracked changes. At this point, you have to make your changes "temporarily go away" so that Git can successfully complete the pull. **The proper way to do that is by using 'git stash'**. This will make all local, uncommitted changes go away temporarily, until you call 'git stash apply', which will then merge your local changes with the latest updates from the remote repository.
Sure, you could always commit your changes, pull from the remote repository, then revert your commit, but that's kinda like beating a baby seal to death with a baseball bat. You just don't do that, no matter how tempting this might sound to your deranged mind.

In summary:

* Your local repository is a full copy of the remote repository. It's not a working copy.
* When you commit a file, you're saying 'This change should eventually reach production'.
* When you push your local repository to its remote counterpart, you're saying 'The production could sure use my amazing new code right about now'.
* If you don't want your change to reach production, **don't commit it**.
* If you're having trouble merging/rebasing because of untracked local changes, perform the following:
* git stash
* git pull / git pull --rebase
* Make sure that the operation completed successfully. You should read the stuff Git reports after performing a pull, often it will tell you of conflicts that make your rebase partial; in this case you should amend the conflicts and continue the rebase using 'git rebase --continue'.
* git stash apply

