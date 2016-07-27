---
layout: post
title: Death by Redirect
date: 2012-12-09 18:14:33.000000000 +02:00
type: post
published: true
status: publish
categories:
- Java
- Web Development
tags:
- deadlock
- HTTP
- java
- Jetty
- Redirect
- Tomcat
meta:
  _edit_last: '8'
author:
  login: yoav@wix.com
  email: yoav@wix.com
  display_name: Yoav Abrahami
  first_name: Yoav
  last_name: Abrahami
---
It is said that the greatest harm can come from the best intentions. We recently had a case where, because of the best intentions, two @#@&amp;*@!!^@ parties killed our servers with a single request, causing a deadlock involving all of our Tomcat instances, including all HTTP threads. Naturally, not a pleasant situation to find yourself in.

Some explanation about our setup is necessary here. We have a number of Tomcat instances that serve HTML pages for our website, located behind a stateless Load Balancer. The time then came when we added a second application, deployed on Jetty. Since we needed the new app to be served as part of the same website (e.g. http://www.wix.com/jetty-app), we proxied the second (Jetty) application from Tomcat (Don’t dig into why we proxied Jetty from Tomcat, we thought at the time we had good reasons for it). So in fact we had the following architecture:

![Diagram](http://engineering.wix.com//wp-content/uploads/2012/12/Death-by-Redirect-1.png)

At the Tomcat end, we were using the Apache HttpClient library to connect to the Jetty application. HttpClient by default is configured to follow redirects. Best Intentions #1: Why should we require the developer to think about redirects? Let’s handle them automatically for her…

At the Jetty end, we had a generic error handler that on an error, instead of showing an error page, redirected the user to the homepage of the app on Jetty. Best Intentions #2: Why show the user an error page? Let’s redirect him to our homepage…

But what happens when the homepage of the Jetty application generates an error? Well, apparently it returns a redirect directive to itself! Now, if a browser would have gotten that redirect, it would have entered a redirect loop and break it after about 20 redirects. We would have seen 20 requests all resulting in a redirect, probably seen a traffic spike, but nothing else.

However, because we had redirects turned on at the HttpClient library, what happened is the following:

1. A Request arrives to our Tomcat server, which resolves it to be proxied to the Jetty application
2. Tomcat Thread #1 proxies a request to Jetty
3. Jetty has an exception and returns a redirect to http://www.wix.com/jetty -app
4. Tomcat Thread #1 connects to the www.wix.com host, which goes via the load balancer and ends at another Tomcat thread – Tomcat Thread #2
5. Tomcat Thread #2 proxies a request to Jetty
6. Jetty has an exception and returns a redirect to http://www.wix.com/jetty
7. Tomcat Thread #1 connects to the www.wix.com host, which goes via the load balancer and ends at another Tomcat thread – Tomcat Thread #3
8. And so on, until all threads on all Tomcats are all stuck on the same one request

![Diagram2](http://engineering.wix.com//wp-content/uploads/2012/12/death-by-redirect-3.png)

So, what can we learn from this incident? We can learn that the defaults of Apache HttpClient are not necessarily the ones you’d expect. We can learn that if you issue a redirect, make sure you are not redirecting to yourself (like our Jetty application homepage). We can learn that the HTTP protocol, which is considered a commodity can be complicated at times and hard to tune, and that not every developer knows to perform an HTTP request. We can also learn that when you take on a 3rd party library, you should invest time in learning to use it, to understand the failure points and how to overcome them.

However, there is a deeper message here. When we develop software, we trade development velocity and risk. The faster we want to develop software, the more we need to trust the individual developers. The more trust we give developers, the more risk we gain by developer black spots - things a developer fails to think about, e.g. handling redirect. As a software engineer, I am not sure there is a simple solution to this issue – I guess it is up to you...
