---
layout: post
title: Backend Engineer Guide
category: Backend Engineer Guide
---

# Backend Engineer Guide

### A training guide for new backend engineers

Welcome to the Wix Backend Engineering Group! (Haven't joined us yet? Check out our [jobs page](http://www.wix.com/jobs/main) and apply.) This training guide should help you get settled-in during your first couple of weeks. It serves as a training program, resource guide, and must-know check-list.

This list is quite comprehensive and could be a bit intimidating. Don't worry – you don't have to know all of this on your first day. It summarizes the list of technologies we use, the tools we have in place, crucial parts of our system, and the Wix product.

Also, the required level of familiarity and knowledge changes for each topic – some bullets only require knowing they exists (robots.txt), while others require weeks-long practice (Scala).

Some of these subjects will be taught as one-on-one sessions, other as team lectures, and the rest you should research on your own. Some of the linked resources are articles, books or videos. The provided links are mostly a suggestion – feel free to find the right resource for you. Some topics have multiple resources listed. You are not required to go over all of them (find the ones best for you).

You also don't have to go over the list in order – we recommend you mix the parts to make things more interesting.

Lastly, we would love to hear your feedback. This guide is dynamic and always changing. Think we've missed a topic or should leave something out? Let us know. Also, if you find a great resource for a specific subject, add it to the list.

Welcome and good luck.




## JVM

* Principles of the JVM
* Garbage Collection & The Memory Model
* IntelliJ
* Tools
    * [Heap dump](/backend-engineer-guide/heap-dump)
    * Profiling
* JVM Arguments (memory, GC, etc.)
* Libraries/applications/frameworks
    * Jetty + Servlet API
    * Spring IoC + Spring MVC
    * Database access from the JVM (JDBC, mongo, why *not* ORMs, etc.)
* Threading and Concurrency
* Common JVM pitfalls

## Scala

### Resources

* [Programming in Scala, 2nd Edition](http://booksites.artima.com/programming_in_scala_2ed) (available in hard-copy)
* [Coursera: Functional Programming Principles in Scala](https://www.coursera.org/course/progfun)
* [Coursera: Principles of Reactive Programming](https://www.coursera.org/course/reactive)
* Wix Scala course (if it's given when you arrive)
* [Scala style guide](http://docs.scala-lang.org/style/)
* [Twitter's Scala School](http://twitter.github.io/scala_school/)
* [Twitter's Effective Scala](http://twitter.github.io/effectivescala/)
* [Scala Koans](http://www.scalakoans.org/)

### Concepts

* Functional Programming
* Object Oriented Programming (in *Scala*)
* Immutability
* [Monads](http://www.slideshare.net/mariofusco/monadic-java) (explained for Java, but a good slide deck)
* [Futures and Promises](http://docs.scala-lang.org/overviews/core/futures.html)
* [String Interpolation](http://docs.scala-lang.org/overviews/core/string-interpolation.html)
* [Implicit Classes](http://docs.scala-lang.org/overviews/core/implicit-classes.html)
* [Scala Collections](http://docs.scala-lang.org/overviews/collections/introduction.html)
* [The Architecture of Scala Collections](http://docs.scala-lang.org/overviews/core/architecture-of-scala-collections.html)
* Creating new constructs with Partial Functions (Async, Metering, etc.)

### Videos

* [Cake Pattern (Daniel Spiewak – The Bakery from the Black Lagoon)](http://www.youtube.com/watch?v=yLbdw06tKPQ)
* [Specs2 (Shai Yallin)](http://www.parleys.com/play/524bdf28e4b0f744c977b457)



## TDD

* [GOOS (Growing Object-Oriented Software Guided by Tests)](http://www.growing-object-oriented-software.com/) (available in hard-copy)
* Libraries
    * [Specs2](http://etorreborre.github.io/specs2/)
    * [Mockito](https://code.google.com/p/mockito/)
    * [Hamcrest](http://hamcrest.org/)
    * [jMock](http://jmock.org/)
* Our testing frameworks and utilities



## Software Engineering

* Solid Principles
* Refactoring Technique
* Reactive and Asynchronous Programming
* CAP Theorem
* Design Patterns
* Numbers every developer should know
* Big Oh



## DevOps and Production

* UNIX/Linux
    * bash/zsh scripting
* OS X/Ubuntu (we don't use Windows) common tools/utils/workflows
* [Maven](/backend-engineer-guide/maven)
* [Git](/backend-engineer-guide/git)
* MySQL
* MongoDB
* [Chef](http://www.opscode.com/chef/)
* Jira
* Staging Machines
* SSH
* BackOffice
* How our projects are deployed from a new project to production
* Production debugging

### Continuous Delivery

* Entire series explaining the subject by Aviran Mordo (start at [part 1](http://www.aviransplace.com/2013/03/16/the-roard-to-continues-delivery-part-1/), goes all the way thru [part 8](http://www.aviransplace.com/2013/08/15/continuous-delivery-part-8-deploying-to-production/))
* Lifecycle ([part 1](http://wix.io/2013/07/24/lifecycle-wix-integrated-cicd-dashboard/), [part 2](http://wix.io/2013/09/01/lifecycle-dependency-management-algorithm-part-2-of-the-lifecycle-series/))
    * RC
    * GA
    * Testbed
    * Rollback
* TeamCity (ci, release)
* Captain's Log

### Operations

* Dude, Where's My Shlomo?
* Fryingpan
* Data Centers
* Dispatchers
* Static
* App Engine (Archive)
* Databases
* Server directories layout (`/opt/wix/...`, `/var/log/...`, `/etc/init.d/...`, etc.)

### Service Infrastructure (SOA)

* Public
* Renderer
* Editor
* Lists DS
* wix-framework (Hoopoe)
* Feature Toggles (Petri)
* RPC

### Monitoring

* New Relic
* AppInfo
* BI
* Nagios



## Web/HTTP

* HTTP Protocol
    * Methods
    * Statuses
    * Headers
    * Cookies
    * etc.
* Familiarity with Modern Web Development
    * Basic Html structure (head, body, script, the DOM, etc.)
    * Javascript
    * REST
    * Ajax
    * Rest vs Ajax
* sitemap.xml
* robots.txt
* SEO
* CDN
* How the Internet works (seriously: DNS, IPs, routers, latencies, etc.)



## Wix.com, The Product

* Premium
* Editor
* Templates
* Wix Sites (on wix.com)
* Site structure (json)
* Viewer
* SEO
* AppBuilder
* TPA
* dev.wix.com
* Ecommerce
* Blog
* Authentication
* Mobile
* (Flash sites...)


## Dev-Centric Culture (What we expect from you)

* Tests are the best example
* The code is the documentation
* Code ownership doesn't block development
* You are responsible for your own code (also ops-wise), we have no QA
