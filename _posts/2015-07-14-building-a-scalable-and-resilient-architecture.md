---
layout: post
title: Building a Scalable and Resilient Architecture
date: 2015-07-14 12:12:25.000000000 +03:00
type: post
published: true
status: publish
categories:
- Architecture
tags: []
meta:
  _edit_last: '34'
  _yoast_wpseo_focuskw: Architecture
  _yoast_wpseo_metadesc: Wix started as a monolith application, the best architectural
    solution back then. As we grew we had to adapt, to a more resilient and scalable
    architecture.
  _yoast_wpseo_linkdex: '83'
author:
  login: aviranm@wix.com
  email: aviranm@wix.com
  display_name: Aviran Mordo
  first_name: Aviran
  last_name: Mordo
---
By Aviran Mordo
Like many startups before us, Wix.com started as a monolith application, which was the best architectural solution when we had no scalability and availability concerns. But as time went by and our small startup grew and gained success, it was time to change the architecture from a monolith—which experienced many scalability and stability issues—to a more resilient and scalable architecture.

However, every time you build a scalable system you have to make some tradeoffs between availability, performance, complexity, development velocity, and many more, and you really need to understand your system in order to make the right tradeoffs.

##Defining System Architecture and Service Level
These days, microservices are a hot topic. But it is not enough to simply build microservices, you also need to understand the boundaries of each microservice. There are many vague claims about how to determine the boundary and size of a microservice, from “you should be able to describe what your microservice does in one line,” to “it should be the size of the team that supports it.” But there is no correct answer. We find that a good rule of thumb (for services that have databases) is that a service should directly access only a couple of database tables to operate.

One very important guideline we set, which helps us determine the boundaries, is based on the service level (SL) needed for each microservice. When we analyzed our system to see how users interact with Wix, we saw two main patterns. Based on these patterns, we defined two different service levels: one for editing sites (Editor segment) and the other for viewing sites (Public segment).

The Public segment supports viewing websites (it is mostly read-only). We defined the Public segment to have higher service-level requirements, because it is more important that a website be fast and available. The Editor segment is where we have all the microservices responsible for website authoring and management. The Editor segment, while important, does not share the same service-level requirements, because its impact is limited to the site owner editing his site.

Every microservice we build belongs to one of these two segments. Having defined these two different SLs, we also architectured our microservices boundaries according to them. We decided that the Editor segment should work in two data centers as an active-standby configuration, while only one data center gets the data writes. However, for the Public segment, we insist that we have at least two active data centers (we actually have three), in which all data centers get traffic all the time.

Since we set this definition, and because the Public segment is mostly read-only data, it made it easier to scale the microservices on the Public segment. When a user publishes his site on the web, we copy the data we need from the microservices in the Editor segment to the microservices in the Public segment, while denormalizing it to be read-optimized.

As for the Editor segment, because we have a lower requirement of availability, writing to just one location is a much simpler problem to solve than writing to multiple locations and replicating the data (which would require us to resolve all kinds of failure-causing conflicts and to handle replication lags). In theory we designed most of our system to be able to write concurrently to two data centers; however, we’ve currently decided not to activate it, as it requires a lot of operational overhead.

##Working with Multiple Cloud Vendors
As part of our Public SL, which requires working in at least two data centers, we also set a requirement for ourselves to be able to work with at least two cloud providers. The two dominant providers that are capable of working at the scale we need are Google and Amazon (we have some services running on Microsoft Azure too, but this is out of scope for this post).

The important lesson we learned by moving to the cloud is that the first thing to do is to invest on the write path—i.e., writing data to the cloud service. Just by writing the data, we discovered many problems and limitations of the cloud providers; for instance, throttlers and data consistency, and eventual consistent systems, which may take a long time to regain consistency on some occasions.

Eventually consistent storage for uploaded files presented a big challenge for us, because when a user uploads a file, he expects the file to be downloadable immediately. So we had to put caching mechanisms in place to overcome the lag from the moment the data is written to the point it is available to read. We also had to use cache to overcome throttlers that limited the write rate, and we had to use batch writes as well. Read path is relatively easy—we just needed adapters for each underlying storage.

We started with Google Cloud Storage. Once we overcame all the problems with Google’s platform, we began the same process on Amazon by developing a data distribution system that copied data from one cloud provider to another. This way the data is constantly replicated between two different vendors, and we avoid a vendor lock. Another benefit is that in cases where we have issues with the availability or performance of one cloud, we can easily shift traffic to the other, thus providing our customers with the best service possible—even when the infrastructure is out of our control.

##Building Redundancy
With this approach of multiple vendors and data centers, we also build a lot of redundancy and fallbacks into our Public segment to reach a high level of availability. For the critical parts of our service, we always employ fallbacks in case there is a problem.

Databases are replicated in and across data centers, and as mentioned previously, our services are running in multiple data centers simultaneously. In case a service is not available for any reason, we can always fall back to a different data center and operate from there (in most cases this happens automatically by customizing the load balancers).

##Creating Guidelines for Microservices
To build a fast, resilient, and scalable system without compromising development productivity, we created a small set of guidelines for our engineers to follow when building a microservice. Using these guidelines, engineers consider the segment the microservice belongs to (Public or Editor) and assess the gains versus the tradeoffs.

* Each service has its own schema (if one is needed)
 * Gain: Easy to scale microservices based on SL concerns
 * Tradeoff: System complexity; performance
* Only one service should write to a specific DB table(s)
 * Gain: Decoupling architecture; faster development
 * Tradeoff: System complexity; performance
* May have additional read-only services that accesses the DB if performance is an issue
 * Gain: Performance
 * Tradeoff: Coupling
* Microservice processes are stateless
 * Gain: Easy to scale out (just add more servers)
 * Tradeoff: Performance; consistency
* Microservice should be independently deployable
* Cache is not a building block of a service, but an optimization to a real production performance problem.

##Scaling with Simplicity with MySQL
When building a scalable system, we found that an important factor is using proven technology so that we know how to recover fast if there’s a failure.

One good example is using databases. You can use the latest and greatest NoSQL database, which works well in theory, but when you have production problems, you need to resume activity as fast as possible. Already having the knowledge of how the system works, or being able to find answers on Google quickly, is very important. This is one reason we usually default to using a MySQL database instead of opting for NoSQL databases, unless NoSQL is a better solution to the problem.

However, using MySQL in a large-scale system may have performance challenges. To get great performance from MySQL, we employ a few usage patterns, one of which is avoiding database-level transactions. Transactions require that the database maintain locks, which has an adverse effect on performance.
Instead, we use logical application-level transactions and avoid any database transactions, thus extracting high performance from the database. For example, let’s think about an invoicing schema. If there’s an invoice with multiple line items, instead of writing all the line items in a single transaction, we simply write line by line without any transaction. Once all the lines are written to the database, we write a header record, which has pointers to the line items IDs. This way, if something fails while writing the individual lines to the database, and the header record was not written—as it marks the finalization of the transaction—then the whole transaction fails. The one tradeoff is that you may get orphan rows in the database, which isn’t a significant issue because storage is cheap and you can clean these rows later if you care about the space.

We also use MySQL as a NoSQL database, simply as a key-value store. We store a JSON object in one of the columns, which allows us to extend the schema without doing database schema changes. Accessing MySQL by primary key is extremely fast, and we found that MySQL is a great NoSQL when you also have consistent writes.

##Summary
When developing a large-scale system, everything is a tradeoff. You need to consciously decide which tradeoffs you are willing to make. But in order to do that, you must first understand your system and set the business service level and requirements. This will affect your decisions and architecture.

You can find out more on Yoav Abrahami's Post  [here](/_posts/scaling-to-100m-design.md), and [on slide-share](http://www.slideshare.net/aviranwix/scaling-wix-with-microservices-architecture-devoxx2015.

Also, here is a link to the Original Post on &raquo; [Voxxed](https://www.voxxed.com/blog/2015/06/aviran-mordo-talk/).
