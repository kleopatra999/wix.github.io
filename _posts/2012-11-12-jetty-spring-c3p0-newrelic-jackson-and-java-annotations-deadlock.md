---
layout: post
title: Jetty, Spring, C3P0, NewRelic, Jackson and Java Annotations Deadlock
date: 2012-11-12 19:56:34.000000000 +02:00
type: post
published: true
status: publish
categories:
- Java
tags:
- deadlock
- java
- threads
meta:
  _edit_last: '8'
author:
  login: yoav@wix.com
  email: yoav@wix.com
  display_name: Yoav Abrahami
  first_name: Yoav
  last_name: Abrahami
---
Yes, we have just found a deadlock on our servers. The type that causes all the threads to lock and gets the whole server stuck. And amazingly, there is no-one to blame.

So, how do you get to a deadlock that no single party is responsible for? We have a Spring web application running on Jetty. This application is monitored via a NewRelic agent. It uses the C3P0 connection pool for connecting to MySQL database. It uses Jackson to serialize and deserialize JSON payloads for incoming requests. All of this is rather standard, like tons of other web applications out on the Internet and enterprise Intranets. Yet, we got a deadlock between two locks – the lock on the ClassLoader and the lock on the annotation processing in AnnotationParser.parseAnnotation().

To understand the deadlock, we need to investigate how such an application starts. Like all web containers, the WAR application is started via one manager thread of the container (the “Jetty WebApp Startup Thread” in the diagram). This thread builds the Spring context, which in turn sets up the C3P0 connection pool among other beans. The “Jetty WebApp Startup Thread” then completes and opens the HTTP port to accept incoming HTTP requests.

Now, C3P0 opens a manager thread to populate the connection pool with the minimum number of connections. This thread loads the JDBC driver class via the ClassLoader, in this case Jetty’s WebAppClassLoader, which has a lock on the loadClass() method. The ClassLoader, while loading the JDBC driver class, calls NewRelic ClassTransformer to transform the loaded calls, weaving into it monitors. The New Relic transformer inspects the JDBC Driver class for annotations on fields, which leads to JDK code of Annotations Reflections.

At the same time, the Jetty WebApp Startup Thread completes the WebApp startup and allows Jetty to open the HTTP port and accept incoming requests. One of those requests arrives (the “Jetty Http Handler Thread” in the diagram), which goes through the Servlet API and Spring MVC servlet. Since the request payload was JSON, it tried to deserialize the payload using Jackson, which in turn inspects the target object classes for annotations used to customize the deserialization process.

Now, the deadlocks happened when we got the following sequence of events (flow diagram below):

1. The C3P0 Manager thread, while loading the JDBC Driver, obtains a lock on the WebAppClassLoader. It does not complete the class loading process fast enough probably because of the New Relic class instrumentation.
2. The Jetty WebApp Startup Thread completes and opens the Jetty HTTP Port.
3. An HTTP request arrives with a JSON payload. This request is assigned a Jetty HTTP Handler Thread (qtp threads in jetty).
4. The Jetty HTTP Handler Thread, while deserializing the JSON payload and via the Jackson library, calls the Reflection Annotations API, which obtains a lock on the parseAnnotation method.
5. The C3P0 Manager Thread, while working on the New Relic logic of class transforming, uses the Reflection Annotations API, which tries to obtain a lock on the parseAnnotation method, and goes into waiting.
6. The Jetty HTTP Handler Thread, while parsing annotations, loads additional classes as required. While loading such a class, it calls the (this) class ClassLoader.loadClass(), which is the WebAppClassLoader. It tries to obtain a lock on the WebAppClassLoader and goes into waiting because the lock is held by the C3P0 Manager Thread.
7. All other Jetty threads, while processing HTTP requests with JSON payload (or result), try to inspect the Jackson annotations and in turn try to obtain the lock on the parseAnnotation. They now all go into waiting.

![Spring MVC](../images/Jetty, Spring, Etc/SpringSchema.png)

The workaround for this deadlock was rather simple. We added code to be run by the Jetty WebApp Startup Thread such that it will obtain one connection from the C3P0 connection pool, before it completes the initialization of the WebApp. This code ensures that the JDBC Driver class will be loaded, instrumented and the locks on the ClassLoader and the parseAnnotation method will be released before any incoming HTTP requests are allowed to arrive.

*Simple, isn’t it?*
