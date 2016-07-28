---
layout: post
title: "‘Leap Second’ Bug Fixed"
date: 2012-07-01 15:58:25.000000000 +03:00
type: post
published: true
status: publish
categories:
- Java
- System
- Tips and Tricks
tags: []
meta:
  _edit_last: '7'
author:
  login: aviranm@wix.com
  email: aviranm@wix.com
  display_name: Aviran Mordo
  first_name: Aviran
  last_name: Mordo
---
On Saturday, at midnight Greenwich Mean Time, as June turned into July, the Earth’s official time keepers held their clocks back by a single second in order to keep them in sync with the planet’s daily rotation.

This one second adjustment caused us many problems.  Most of our system that run on Linux and Java started to misbehave, ranging from 100% CPU usage, very high load average to total crash.

It took us a while to figure out that the one second adjustment was the root cause, but crossing information from the web we saw that we are not the only ones with the problem.

Eventually we fixed the problem with this easy command :
date; sudo date `date +"%m%d%H%M%C%y.%S"`; date;
That is it,  once you run it you don't even have to restart your java applications, they will start behaving normally again.
I