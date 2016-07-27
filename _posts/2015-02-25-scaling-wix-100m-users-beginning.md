---
layout: post
title: 'Scaling Wix to over 100M Users: The Beginning'
date: 2015-02-25 00:44:47.000000000 +02:00
type: post
published: true
status: publish
categories:
- Scaling Wix to over 100M users
tags:
- Gradual Rewrite
- Scale
meta:
  _edit_last: '8'
  _yoast_wpseo_focuskw: Scaling, Wix, Startups
  _yoast_wpseo_title: 'Scaling Wix to over 100M Users: The Beginning'
  _yoast_wpseo_linkdex: '66'
author:
  login: yoav@wix.com
  email: yoav@wix.com
  display_name: Yoav Abrahami
  first_name: Yoav
  last_name: Abrahami
---
When I prepared the first presentation to tell the Wix scaling story, we had just over 10,000,000 (10M) registered Wix users. By the time I presented, we had over 12M. Now, we have over 60M users and 3 versions of the presentation ([10M](http://www.slideshare.net/yoavaa/dos-and-donts-on-the-way-to-10m-users), [30M](http://www.slideshare.net/yoavaa/scaling-up-to-30-m-users-16653258), and [50M](http://www.slideshare.net/yoavaa/scaling-wix-to-over-50-m-users)).

As we started Wix in 2006 it was not apparent what exact realization of building Flash websites worked or what it really meant to make a WYSIWYG website builder. We were focused on building two Flash applications: one that edits websites (creating an XML document representation of the built site) and another that displays a site (given the XML document). Most of the development was with Flash, but we also needed a server to store and serve the XML files based on the site domain or URL pattern.

Our first backend engineer built that server based on Tomcat, Hibernate, Ehcache, and MySQL. He also based our server on his own framework, which generated the Entity Java files from the Hibernate HBM files, allowing for custom code to be added by inheriting from the generated classes.

![Scaling-Wix-Image1](../images/Scaling-Wix-The-Beginning/InitialArchitechture.jpg)

On my first day at Wix in 2006 I was asked to comment on that setup. I said, “It’s great to start with, but you will have to replace it within 2-3 years.” The logic is that in the initial stages of a startup, when we do not know what will work and what transformations the product will undergo, it is important to develop fast and not focus on clean engineering, scalable architecture, or test-driven development (TDD). If we had practiced TDD or had some ordered design at that time, we may not have managed to build Wix.

In 2008 I was told by one of the founders, “You told us that we would have to replace our server side about now, you just failed to mention how hard that’s gonna be.” During those two years, the Wix server was built as one artifact supporting all services, from storing the XML files and serving them, to uploading media files, to supporting the backend for a comments component.
One notable example operation of that server was the save method for a document (e.g., a site). The save method was designed around the CRUD pattern that Hibernate advocates.

It was both creating new documents and updating existing ones. At a certain stage, we decided that we would not delete documents—rather, we would mark documents as deleted. So the save method was now handling delete as well. Later, we added premium plans for sites and wanted to mark on the document its premium status. So we added the premium flag field to the document and added logic into the save method to handle it (e.g., cannot delete a document with a premium plan; cannot add a premium plan to a deleted document). As our product progressed, more functionality was pushed into that one save method. We used to joke that the save method could do anything, including make coffee!

We started replacing that server in 2008, breaking it piece by piece. We finally shut it down in 2012. It took 4 years to migrate from that initial server to the architecture we have today because we continued to develop our product and transform it from a Flash website builder to an HTML5 website builder.
The actual story of that transformation is beyond the scope of this post, but I will get to it in a later post. But the questions remain: Did we make the right decision to build on a server that was not well architected? Was it worth it to move fast at the cost of accruing a huge technical debt?

At Wix, the first lesson we learned from the early years is that when we begin a project or a startup, if we do not know what variation of our product will work (as most startups do not know), we should move fast. We should be opportunistic, utilizing any tools we are familiar with, regardless of scale or ordered methodologies (such as TDD). And yes, we will gain technical debt.

The second lesson, the one we failed at, is that we should build fast, but also build for gradual rewrite. From the initial stage we should prepare to replace parts of our system if and when we need—and with minimal effort. Had we done so, we could have replaced our initial server within a year or two, and not spent 4 years on that effort. However, we built a classical spaghetti ball server and paid the price for it.

To summarize, in the early stages, build fast and build for gradual rewrite.
