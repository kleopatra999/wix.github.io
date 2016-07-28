---
layout: post
title: How Does HikariCP Compare to Other Connection Pools ?
date: 2015-04-28 11:08:34.000000000 +03:00
type: post
published: true
status: publish
categories:
- Java
- MySQL
- System
- Tips and Tricks
- Web Development
tags:
- connection pool
- database
- HikariCP
- java
- MySQL
meta:
  _edit_last: '29'
author:
  login: laurentg@wix.com
  email: laurentg@wix.com
  display_name: Laurent Gaertner
  first_name: Laurent
  last_name: Gaertner
---
This blog post is a follow up to “[How Many Threads Does It Take to Fill a Pool?](/_posts/How-Many-Threads.md)”, written by Yoav Abrahami in June 2013.

In Yoav’s post, he compared the performance of three pools: C3P0, BoneCP, and Apache DBCP. In this post, we added an additional pool for comparison: [HikariCP](http://brettwooldridge.github.io/HikariCP/). We used the same code and MySQL setup as in the blog post mentioned above, but we added an HikariCP benchmark.
The configuration for this benchmark is:

* Minimum idle: 20
* Maximum pool size: 20
* Connection timeout: 30 sec
* AutoCommit: true

The results for HikariCP are as follows:

![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph1.png)
![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph2.png)
![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph3.png)

As we can see in these three charts, HikariCP connection acquire and release performance is better and more consistent than the previously tested pools. Most of the acquire operations completed within 1000 nSec, while most of the release operations completed within 1000-3200 nSec.

![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph4.png)

In the fourth chart, each horizontal line represents one database (DB) operation. Brown shows the time waiting to acquire a connection, green shows the time to execute the DB operation, and blue shows the time to return a connection to the connection pool. There are neither brown nor blue lines unless we zoom in further, which indicates that the overhead of HikariCP is insignificant compared to the actual I/O time of working with a database.

Those impressive results are even better than what we got with Apache DBCP.

We conducted an additional test to see how HikariCP would react to a timeout. We simulated a connection timeout for a few seconds by blocking the MySQL port 3306.
Here are the results:

![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph5.png)
![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph6.png)
![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph7.png)

As we can see in the previous three charts, there is a long tail extending to 320 mSec. This was expected because we introduced a connection timeout.

![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph8.png)

In the fourth chart, we can see that the connection was down for approximately 4 sec. The operations that were in progress when the connection went down (indicated by the long green lines) appear as though the database is slow to respond. This makes sense because the TCP timeout is normally in the order of minutes, and when a network connection fails, it takes up to that amount of time to figure out that there is a problem. Only on timeout or when the connection is restored will the client be able to distinguish between a slow server or a failed server.
Once the connection is available, we see another short green group for about 33 mSec, followed by small blue lines (between 50.24 and 50.60). The blue shows that the connection pool performed another DB operation to check what happened.
Note that the JDBC standard does not provide a way to test a connection, and the only alternative is to try using the connection for another operation before realizing it needs recycling (closing and opening new connections).
Next we can see some brown lines during 130 mSec, indicating time to recycle connections. The pool restores normal operations after that.

![Graph 1](../images/How-Does-HikariCP-Compare/HikariCPgraph9.png)

##Conclusion
HikariCP seems to perform better than the other connection pools we’ve tested—C3P0, BoneCP, and Apache DBCP. However, when selecting a connection pool, there are other aspects to take into account, such as the configuration options it provides and connection testing. Determine what’s most important to your business before deciding which to use. In our case, we’ve decided to use HikariCP and are happy so far with the results.
