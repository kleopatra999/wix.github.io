---
layout: post
title: The Microservices and DevOps Journey at Wix
date: 2015-07-22 14:07:18.000000000 +03:00
type: post
published: true
status: publish
categories:
- Architecture
tags: []
meta:
 author:
  login: jonathani
  email: jonathani@wix.com
  display_name: Jonathan Israel
  first_name: Jonathan
  last_name: Israel
---
We at Wix.com started our journey on DevOps and Microservices about two years ago and recently switched from a monolithic application to a microservices-based application. Yes, it took us a full two years to complete the transition from monolith to microservices!

Arun Gupta ([@arungupta](https://twitter.com/arungupta)) got connected with Aviran Mordo ([@aviranm](https://twitter.com/aviranm)), head of backend engineering here at Wix, through twitter.

<blockquote class="twitter-tweet" lang="en">
<p dir="ltr" lang="en"><a href="https://twitter.com/arungupta">@arungupta</a><a href="https://twitter.com/Valdarez">@Valdarez</a> we at <a href="https://twitter.com/WixEng">@WixEng</a> are doing microservices for over 4 years now with over 100 microservices in production</p>
— Aviran Mordo (@aviranm) <a href="https://twitter.com/aviranm/status/614442579535343617">June 26, 2015</a></blockquote>

We migrated to microservices because the “system could not scale” and the requirements for functional components were varied. The journey took our WAR-based deployment on Tomcat to fat JAR with embedded Jetty. On a side note, take a look at [WildFly Swarm](http://wildfly-swarm.io/) if you are interested in a similar approach for Java EE applications.

##Video Interview
Arun Gupta discussed some points with Aviran about this journey and you can watch the same below.

<iframe width="420" height="315" src="https://www.youtube.com/embed/P_xZ99ODwIU" frameborder="0" allowfullscreen></iframe>

In this discussion, you’ll learn:

* Why Continuous Delivery and DevOps are important requirements for microservices?
* How we migrated from a big monolith to smaller monoliths and then a full-blown microservices architecture
* How database referential integrity constraints were moved from database to application?
“micro” in microservices refers to the area of responsibility, nothing to do with LOC
* Neither REST nor messaging was used for communication between different services. Which protocol was used? [JSON-RPC](http://json-rpc.org/)
* How do services register and discover each other? Is that required during early phases?
* Why [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) and [KISS](https://en.wikipedia.org/wiki/KISS_principle) are important?
* [Chef](https://www.chef.io/) for configuration management and how to make it accessible for massive deployments
* [TeamCity](https://www.jetbrains.com/teamcity/) for CI
* Is 100% automation a requirement? Can 100% automation be achieved? Learn about [Petri](http://wix.github.io/petri/), Wix’s open source framework for A/B testing
* Relevance of hybrid cloud (Google, Amazon, Private data center) and redundancy
* Hardest part of migrating from monolith to microservice
* How much code was repurposed during refactoring?
* Where was the most effort spent during the two years of migration?
* Distributed transactions
* What was the biggest challenge in DevOps journey?

Look out for a nice story towards the end that could be motivating for your team as well.

##Additional Material
Watch the slides from DevoxxUK:
[Scaling wix with microservices architecture Devoxx London 2015](http://www.slideshare.net/aviranwix/scaling-wix-with-microservices-architecture-devoxx2015) By [Aviran Mordo](http://www.slideshare.net/aviranwix)

You can also learn more about our architecture in [Scaling Wix to 60m Users](http://stackshare.io/wix/scaling-wix-to-60m-users-from-monolith-to-microservices).
Enjoy!

Here is a link to the Original Post, by **Arun Gupta**, as posted on &raquo; [Voxxed](https://www.voxxed.com/blog/2015/07/microservices-and-devops-journey-at-wix/).
