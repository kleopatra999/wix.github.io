---
layout: post
title: 'Scaling to 100M: To Cache or Not to Cache?'
date: 2015-03-18 17:41:32.000000000 +02:00
type: post
published: true
status: publish
categories:
- MySQL
- Scaling Wix to over 100M users
tags: []
meta:
  _edit_last: '8'
  _yoast_wpseo_focuskw: cache memory
  _yoast_wpseo_linkdex: '63'
author:
  login: yoav@wix.com
  email: yoav@wix.com
  display_name: Yoav Abrahami
  first_name: Yoav
  last_name: Abrahami
---
This blog post is part 2 in the “Scaling Wix to over 100M Users” series. Read part 1 [here](/_posts/The-beginning).

When Wix started, we used the Tomcat, Hibernate, and Ehcache stack with a MySQL database and Flash front end. Why did we choose that stack? Simply because our first backend developer had experience with that stack from his previous workplace.

Part of that architecture was Ehcache—a great caching library for Hibernate and the JVM—which makes a map-like abstraction for an in-memory cache that can also be configured as a distributed cache. Ehcache, unlike Memcached, runs in process (in the JVM), and its distributed feature fully replicates cache state between all the nodes in a cluster. Note that at this time (around 2006-2008), Ehcache was still an independent open source project and not yet part of Terracotta. (With Terracotta, the replication and distribution model may be different, but that is not an important point for this article.)

![Scaling cache](../images/Scaling-Wix-To-Cache/Scaling-to-100M-Cache.jpg)

##Aspects of using a cache
Once we had real customers, we set up two Tomcat servers for redundancy. Following the architecture guidelines, we set up a distributed Ehcache cluster between the servers. We made the assumption that MySQL was slow (like any other SQL engine), and therefore an in-memory cache would make read operations much faster and reduce workload from the database.

However, what happened when we had a data problem, like data corruption or data poisoning? Let’s denote that problem as “bad state”. One such case was when we deployed a version of the Wix Editor that produced invalid Wix site definitions. The symptoms of this problem were corrupted user sites—i.e., users were unable to view or edit their sites. Fortunately, because we had (and still have) such a large user base, users discovered and complained about this problem immediately. 

We reverted the deployment of the problematic version and fixed the corrupted definition files in the database. Unfortunately, even after we fixed all the places where a site definition was stored, customers continued to complain about corrupted sites. This was because we just fixed the bad state stored in the database, forgetting that the cache also stored copies of our data, including the corrupted documents.

How come we forgot the cache? Well, we tend to forget what we cannot see. Ehcache is just a “black box” cache—a Java library without a SQL interface to query or a management application to view the cache content. Because we did not have an easy way to “look” into the cache, we could not diagnose and introspect it when we had corrupted data incidents. (Note that some other cache solutions have a management application making them a “white box” cache, but we did not opt to use any of those.)

Once we realized our bad state issue was probably in the cache as well, to resolve the problem, we first had to fix the bad state in the database. Both app servers still had the bad state in the cache, so we stopped one server to clear its in-memory cache and then restarted it. But because the cache was distributed, even after restarting the server, its in-memory representation of the cache was replicated from the second app server. As a result, it ended up with the bad state again. Restarting the second app server at that point would not help, as it got the bad state replicated from the first. The only way to clear that bad state was if we stopped and restarted both servers, resulting in a short downtime of our services.

At this point you should ask, “What about cache invalidation?” Because we were using Ehcache, which has a management API that supports invalidation, we could have written specific code instructing our app servers to invalidate the cache (an invalidation switch). If we did not prepare an invalidation switch for a certain type of data, we would again need to restart both servers at once to clear the bad state.

Sure, we could have built a management application for Ehcache, adding the ability to view the data and invalidate it. But when it came time to make that decision, we wondered, “Do we really need a cache?”
The first thing to do was to check the MySQL statistics. It turns out that if using MySQL correctly, we could get submillisecond reads, even for large tables. Today we have tables with over 100 million rows that we read from at submillisecond performance. We do so by providing the MySQL process sufficient memory to handle disk cache, and by reading single rows by primary key or an index without joins.

In the end, we learned that we do not need a cache. In fact, in most cases where people introduce a cache it is not really needed. We claim that a cache is not part of an architecture; rather, it is one of a set of solutions for a performance problem, and not the best at that.
Our guidelines for using a cache are as follows:

1. You do not need a cache.
2. Really, you **don’t**.
3. If you still have a performance issue, can you solve it at the source? What is slow? Why is it slow? Can you architect it differently to not be slow? Can you prepare data to be read-optimized?

If you do need to introduce a cache, think of the following:

* How do you invalidate the cache?
* How do you see the values in the cache (black box vs. white box cache)?
What happens in a cold start of your system? Can the system cope with traffic if the cache is empty?
* What is the performance penalty of using the cache?

