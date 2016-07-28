---
layout: post
title: How to pass an interview at Wix
date: 2012-10-07 19:16:40.000000000 +02:00
type: post
published: true
status: publish
categories:
- Java
- Tips and Tricks
- Web Development
tags:
- hiring
- Interview
- java
meta:
  _edit_last: '10'
author:
  login: alexeyr@wix.com
  email: alexeyr@wix.com
  display_name: Alex Reznick
  first_name: Alexey
  last_name: Reznick
---
During the last couple of months I've interviewed a quite a few people for Senior Developer/architect positions here at Wix (Java). A complete surprise to me and my colleagues was the high number of inadequate candidates that applied to the position. Here at Wix we do have very high hiring standards, and we did turn down some highly capable candidates because we weren't sure they a good match for our team, but most of the people who came to the interviews didn't match even the basic requirements.

So I've decided to devise a list of those basic requirements that one should match to be a Senior Dev at Wix.

##Basic Programming
You should be able to write a basic recursion on a piece of paper. In your sleep, with both hands tied behind your back. Calculate a factorial, for example. There is no excuse for you if you can't. All recursion takes is an understanding of the programming language that you're writing with, your most basic tool, works. It doesn't matter if you never ever used recursion in your career. (I had, by the way). You never know when this pesky recursion will be the most effective way to do something, and anyway – we all going to write in functional languages soon enough, right ;-)?

You should be able to answer some basic questions about Generics. And type-erasure. And what is the difference between List, List<T> and ArrayList<T>. Also, when this difference matters and when it doesn't.

##Basic Data Structures
You use HashMap, (or Dictionary if you write in C#) right? How is it implemented, at least on the most basic level? What is the difference between a HashMap and a TreeMap? What's the difference between ArrayList, and LinkedList?

##Basic Operating Systems topics
What is the difference between a process and a thread? What happens to the threads you spawn after the application exits? What synchronization mechanisms you know in Java except "synchronized"? Why are they needed?

How disk IO is done? A hint – not by magic. If you plan on deploying an application to production servers, you will definitely hit IO bottleneck sooner or later. If you don't understand, even on the most basic level how it's done, you won't be able to optimize anything.

For web developer - what is a c10k problem, and how is it solved in your choice of web server. What is Async IO? (And I would expect to hear at least some of the terms: "select", "epoll", "completion ports", "callback", etc.)

##Advanced Java and JVM
Every senior developer should know the basic terminology and some implementation details about the Garbage collector. I wouldn't expect everyone to recite the difference between a concurrent and parallel collector, but I wouldn't ever hire a candidate who has no idea how many generation the JVM GC has, and what are those things. Every senior dev, should be able to tune the JVM on the server to some extent, and without this basic knowledge, you wouldn't even know what to Google for.

Another popular question, in many interviews I had, is types of references in the VM (yes there are more than one!!!). Although this is a niche piece of knowledge, and I would let it slide if the candidate didn't know anything about it, there are some problems that you can't solve without this knowledge and it's impressive if you do know.

Any Java programmer should have some idea about JIT, how and when byte code is compiled to machine code and what's the difference between the two. There is absolutely no excuse for not knowing this. Also it would be nice if the candidate knew something about the class-loading process.

Another topic – you should know what is "Inversion Of Control" and "Dependency Injection" are, even if you haven't used them ever. Those are in the mainstream of Java programming for enough time for everyone to hear of them. If you still don't know what those are – it means that you just don't care enough about keeping yourself updated, and this means that you are not senior developer.

##Unit testing
You should at least know what they are, even if any company that you've worked so far didn't let you test your code. And probably, you should also know what problems mock frameworks are aiming to solve. Even if you haven't used Unit testing before, or even against them for some reason, you should have a well formulated opinion on the subject. You can be pro, you can be con, but you should care!!! The quality of your code should be important to you, as it is to us. If it's not – your place is not with us.

##Web programming
As a web developer, the basic unit of work is an HTTP request. You should understand it from inside out. Heck, you should be able to perform a GET request with telnet, and nothing more. Headers, cookies, status-codes should be your bread and butter. I will not insist on anyone remembering the exact semantic difference between 502 and 504 status codes, and what is the status code for "I'm a tea pot" response, but you should have an idea, and you should be able to read the relevant RFCs and understand them.

I once heard that there are only two hard problems in programming: naming things, and cache invalidation. Well without knowing something about caching, the second problem will turn from hard to impossible. You need to know this.

##Architecture
The line that separates senior developer and architect is quite thin, so senior dev should know his architecture. What is a database? What's the difference between a server and a service; REST and web-service? What's MVC?

You should be aware of the latest trends in the industry. For example - know about actors, NoSql movement, Big Data, Scala…

##Be reasoned
For every answer you give, you need to be able to reason about it. You chose to implement that project with a Key/value store, instead of RDBMS? Cool, no please tell me why? What are the benefits of your solution, and in which cases it will fall short. You think that distributed source control is lame? Please care to explain. You think that Scala is god's gift to programmers? What exact features of Scala make it so compelling to you, and please don't tell me "all of them". You should be able not to repeat the last thing that you read in some blog, but to have some level of understanding in things you're talking about. And if you don't – tell us. No one can know everything. We know that.

##Be prepared to show how you code
We want to hire the best. And to separate those who can talk, from those who can code, we want to see you program. Knowing all the answers, and reciting every buzz-word is not enough, show us how great you are. Impress us.

##Do your homework
Poke around. Visit the web-site. Look at the job description that we posted especially for you. Try to locate as much info as you can about us. You've got Google, and LinkedIn, and a lot of other sites that let you find a lot of info about us. This will not only score you some extra points with us during the interview, but it will also let you prepare much better. Read this blog post, I'm writing it especially for you. Show that you care about getting this job, cause if you don't we don't need you.

If you managed to read all this, and know most of the stuff, we really hope to see you soon, dear candidate.
