---
layout: post
title: Rekuire | a module for NodeJS
date: 2013-03-07 02:03:43.000000000 +02:00
type: post
published: true
status: publish
categories:
- JavaScript
tags:
- Javascript
- modules
- nodejs
- source
meta:
  _edit_last: '13'
  _wpas_done_all: '1'
  foobar_type: default
  foobar_select: '0'
author:
  login: nadavl@wix.com
  email: nadavl@wix.com
  display_name: nadavl@wix.com
  first_name: ''
  last_name: ''
---
Just wanted to share a nice piece of code I created...

During my recent experience with NodeJs, there was one thing that bugged me the most - in Node, to include another module into the scope, you use 'require()' to import the other module.

The thing is, that if it is not a third party module, you have to specify the full path in your project (absolute or relative) in order to do so. it usually looks something like this:
require('../../../commands/MyCommand.js');
Not only it is ugly, it is terribly hard to refactore the code afterwards (IntelliJ's refactoring fails to do it)...

So, I created this module called [rekuire](https://github.com/nadav-dav/rekuire).
rekuire scans the project paths upon first execution, so all you need to specify, is the file name!
**No paths!** (it saves a bunchload of time)
rekuire('MyCommand.js');

In order install, using npm, type $ [npm install rekuire](https://www.npmjs.com/package/rekuire)

And don't forget, you are **more then welcome** to check it out and **contribute** to it on github. :)
