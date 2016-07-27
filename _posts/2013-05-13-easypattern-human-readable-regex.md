---
layout: post
title: EasyPattern | Human readable RegEx
date: 2013-05-13 19:33:14.000000000 +03:00
type: post
published: true
status: publish
categories:
- JavaScript
- Web Development
tags:
- Javascript
- nodejs
- pattern matching
- regex
meta:
  _edit_last: '13'
  foobar_type: default
  foobar_select: '0'
  _syntaxhighlighter_encoded: '1'
  _wpas_done_all: '1'
author:
  login: nadavl@wix.com
  email: nadavl@wix.com
  display_name: nadavl@wix.com
  first_name: ''
  last_name: ''
---
Checkout EasyPattern for Javascript and NodeJs!

During some work on our internal tool, I have created EasyPattern, which is a readable alternative to regular expressions.
It is great to match urls with ease, and keep the code super readable and configurable.

For example:

Basic testings

```javascript
var easyPattern = require("easyPattern");
var pattern = easyPattern("{file}.js");
pattern.test("archive.zip"); // false
pattern.test("index.js"); // true
```

Basic matching

```javascript
var pattern = easyPattern("{folder}/{filename}.js");
var result = pattern.match("foo/bar.js");
//result = {folder: "foo", filename: "bar"}
```

Wildcard matching

```javascript
var pattern = easyPattern("*.{extension}");
var result = pattern.match("/root/folder/file.exe");
//result = {extension:"exe"}
```

Advance matching

```javascript
var pattern = easyPattern("{*}/{filename}?{*}");
var result = pattern.match("www.site.com/home/hello.js?p=1");
//result = {1:"www.site.com/home", 2:"p=1", filename:"hello.js"}
```

**You can [download and play with it here](https://www.npmjs.com/package/easypattern)**