---
layout: post
title: 'HttpComponents and cookies or: How to screw up your RPC framework'
date: 2012-10-07 19:39:53.000000000 +02:00
type: post
published: true
status: publish
categories:
- Java
- Web Development
tags:
- Apache HttpComponents
- Cookies
- java
- RPC
meta:
  _edit_last: '10'
author:
  login: alexeyr@wix.com
  email: alexeyr@wix.com
  display_name: Alex Reznick
  first_name: Alexey
  last_name: Reznick
---
Here at Wix, we do a lot of server-to-server communication. Most likely any given request that you'll send to Wix will hit at least 2 services that again most likely will reside on different servers (that is not including reverse proxies, load-balancers, and etc.). Dealing with up to tens of millions requests per day, it's quite obvious that we do a lot of server-to-server. For over a year, the transport protocol of our choice is JSON-RPC. It has all that we need:

* JSON is both humanly readable, and writable (since the RPC invocation is just a JSON object)
* It's very debuggable - we can just curl our service with any request and see * how it reacts)
* Jackson serialization framework is blazingly fast.
* Using Http as the transport protocol, though adding some overhead to the message (headers and such) allows us to use the same routing/balancing mechanisms for server-to-server communication as we use for user originated requests.

While designing our own implementation of JSON-RPC protocol, we made a big mistake (well actually I did, but no one have stopped me, so I share the blame ;-)) – we chose [Apache HttpComponents](http://hc.apache.org/) (a.k.a Apache Http Client 4.x) to be our HTTP transport provider, without giving it a though. After all, we used it for various HTTP communication tasks before, and it always was up for the job.

At the beginning all went well, we migrated most of our systems to the new RPC framework, and it became easier to find bugs and reproduce them both the in the RPC framework and in the services it exposed. And then the problems started. As any web oriented platform Wix tends to use cookies for storing some client data at the client side. We use cookies for authentication, for stickiness, and for sharing parts of the user's profile with the Flash/JS client application. At the server we have a number of HTTP request parsers that read data from those cookies and copy it to request context to be used throughout the server. It was tempting to reuse this mechanism in the RPC context, and we did.

Technically, this means that the RPC client sent all the relevant cookies to the server, and the server used the same request parsers to read data from those cookies. This was a BIG mistake, and here is why: Apache HttpClient implements a browser. And like any modern browser it supports cookies. When it receives cookies from server, it validates and stores them, and resends them in the next request to the server. Moreover HttpClient can be used in a multithreaded environment. This means that you can have only one instance of HttpClient and use it for all the requests that you issue.

The problem with that is that the cookie store is SHARED between all those requests – and this means that if you have saved a session cookie for user A in the cookie store, and the next request that is send to the server has no session cookie to override it, it will be sent with A's session possibly exposing his private data to an un-authorized client. Moreover, even if A's session cookie was saved to the cookie store, it doesn't means that it will be sent to the server, since until the request is issued, the cookie can be overridden by another cookie from another request.

Another problem with using the same HttpClient for many requests is that its connection pool may become a bottleneck if it's supposed to server many user requests. Well this problem can be resolved quite easily. Just create a new HttpClient for every user request. Sure, this way you can't reuse connections between requests to the same server, and add additional overhead, but it's better that sharing session between different users, right?

Another problem is with cookies returned by the service. The service may be accessible from both inside and outside the data-center. In this case different DNS names will be used for its internal and external IP address. But we haven't implemented the needed flexibility, and the cookies were always set for a single domain (usually .wix.com). But the service may have been accessed on *http://internal_server01.wixdatacenter.com/001_service _endpoint/*, and then the cookie will be ignored by HttpClient, and a warning message for this will be logged to the server error log polluting it. This problem can be fixed by setting the HttpClient to ignore all cookies, with an IGNORE_COOKIES policy, but if you chose cookies to be a part of you protocol, you may need some of them.

So to summarize:

* HttpClient is not really suitable for server-to-server communication
* Cookies are not the best transport for data in a server-to-server scenario
* Don't take any framework for granted when starting to use it in new scenarios.
* Every external dependency should be carefully reconsidered in new context.

