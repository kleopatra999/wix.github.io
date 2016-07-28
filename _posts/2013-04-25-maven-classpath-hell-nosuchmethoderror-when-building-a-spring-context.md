---
layout: post
title: When Maven Dependency Plugin Lies
date: 2013-04-25 09:48:44.000000000 +03:00
type: post
published: true
status: publish
categories:
- Java
- maven
- spring
tags:
- classpath
- depedencies
- java
- maven
- NoSuchMethod
- spring
meta:
  _edit_last: '14'
  _wpas_done_all: '1'
author:
  login: ittaiz@wix.com
  email: ittaiz@wix.com
  display_name: ittaiz@wix.com
  first_name: ''
  last_name: ''
---
##The Problem
We had an integration test which creates a spring ClassPathXmlApplicationContext and while doing so the test blew up with a NoSuchMethodError. It turned out that we had conflicting versions of dependencies on Spring artifacts. This in itself is not an unusual problem - such problems are addressed with the maven dependency plugin using the verbose option.

However, what do you do when the maven plugin is wrong?

##Investigation
We started to dig in and we found that the AbstractAutowireCapableBeanFactory in its getTypeForFactoryMethod method tries to access the GenericTypeResolver resolveReturnTypeForGeneric method and fails on a 

```java
java.lang.NoSuchMethodError:
org.springframework.core.GenericTypeResolver.resolveReturnTypeForGenericMethod(Ljava/lang/reflect/Method;).
```

Initial investigation and googling we found that the method was added in 3.2.0 while we're supposed to be running with 3.1.1.

Further investigation determined that spring-data-mongodb depends on spring framework in range 1 (http://repo1.maven.org/maven2/org/springframework/data/spring-data-mongodb-parent/1.0.1.RELEASE/spring-data-mongodb-parent-1.0.1.RELEASE.pom) and because maven takes the latest available version given that range [2](http://www.maestrodev.com/better-builds-with-maven/creating-applications-with-maven/resolving-dependency-conflicts-and-using-version-ranges/) it tried to take 3.2.2.

Note that the above changes a bit given a conflict between an explicit version dependency and a range dependency but, IINM, when determining the dependencies of spring mongo there is no conflict.

##The problem was further masked by two symptoms

1. We have other projects that use this pattern and have no problem- This was explained by the fact that the conflict-resolving mechanism of maven chooses the nearest version it finds by default [3](http://www.maestrodev.com/better-builds-with-maven/creating-applications-with-maven/resolving-dependency-conflicts-and-using-version-ranges/) and since all other projects which need spring-data-mongodb depend on this project they were lucky enough to grab the 3.1.1 version and not 3.2.2
2. dependency:tree shows it brings 3.1.1 while bringing 3.2.2- Since the stack trace showed other results I wrote a test which checks from which jar each of the above classes comes from and verified that indeed the AbstractAutowireCapableBeanFactory class arrives from spring-beans 3.2.2 and not 3.1.1 as "mvn dependency:tree" showed a big thanks to [XYZWS](http://bit.ly/10zD1iV) for the code snippet of finding the jar of a class in runtime).

Maven dependency:tree output showing spring-beans:3.1.1 is used in the artifact <script src="https://gist.github.com/ittaiz/5459609.js"></script>

This is the test which proves spring-beans:3.2.2 is used in the artifact (asserting what the jvm in the error was saying)
<script src="https://gist.github.com/ittaiz/5452280.js"></script>

The reason spring-core artifact came in 3.1.1 when spring-beans came as 3.2.2 is that our framework explicitly depends on spring-core and this artifact explicitly depends on the framework. This means spring-core 3.1.1 from framework is 2 hops which is shorter than the 3.2.2 from spring-data-mongodb.

##The Solution
Depend on spring-data-mongodb while excluding spring-beans like so:
<script src="https://gist.github.com/ittaiz/5453108.js"></script>

##The Open question mark
Why dependency:tree (in verbose mode) did not show that it brings spring-beans in 3.2.2 but in 3.1.1 while explicitly specifying that spring-core 3.2.2 was removed due to conflict?
I chalk this up to a bug in the dependency plugin.

**Update:** Thanks to [@Samuel_Langlois](https://twitter.com/search?q=%40%20Samuel_Langlois&src=typd) we confirmed that the "open question mark" is indeed a Maven Dependency Plugin [bug](https://issues.apache.org/jira/browse/MDEP-339) which was resolved in 2.5 and so using 2.7 and forward will show you the correct info.

<script src="https://gist.github.com/ittaiz/5475973.js"></script>