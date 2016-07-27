---
layout: post
title: Scalapeño – The Israeli International Scala Conference
date: 2013-06-30 23:07:52.000000000 +03:00
type: post
published: true
status: publish
categories:
- Scala
tags:
- conference
- scalapeño
meta:
  _edit_last: '5'
  foobar_type: default
  foobar_select: '0'
  _wpas_done_all: '1'
author:
  login: shaiy@wix.com
  email: shaiy@wix.com
  display_name: Shai Yallin
  first_name: Shai
  last_name: Yallin
---
In slightly more than 2 weeks, [Tomer Gabel](http://tomergabel.com/) - with whom I have founded [Underscore](http://www.meetup.com/underscore/), the Israeli Scala user group - and myself are hosting [Scalapeño](http://www.2013.scalapeno.org.il/), the first Israeli Scala conference.

Working to promote the conference, Typesafe have been so kind as to host me as a guest blogger. Here's a reblog of that post.

##Of two beginnings...
I first came upon the name Scala in 2009, when the startup I worked for started using Groovy to write smaller, more concise end-to-end tests. Starting to learn Groovy, I came upon the [now-infamous quote](http://macstrac.blogspot.co.il/2009/04/scala-as-long-term-replacement-for.html) by James Strachan. I shortly looked at the Wikipedia page for Scala, got scared by the syntax (“it looks too much like Ruby. I hate Ruby!”) and went back to Groovy.

Fast-forward to late 2010. I'm now a backend engineer for Wix.com, where lots of server software needs to rewritten, and this time it needs to be more maintainable, readable, testable and concise. I recall my brief encounter with Scala and decide to give it another shot, using the [O'Reilly online book](http://www.oreilly.com/ofps/) as my guide. This time I got hooked. The concepts of immutability hit close to home and I had good experiences with the collections framework in Groovy, and more importantly, it all just made sense. I had made up my mind – I'm now a Scala developer.

##A very delicate time
And it wasn't easy. I managed to get a core team of engineers excited about the language, its powers and potential, and we decided to develop one project in 100% Scala. However, it soon became apparent that the tools just don't cut it. These were the days of IntelliJ IDEA 10 (our IDE of choice) and its Scala plugin was… less than convenient. We ran into frequent bugs and issues with the development environment, and we made some bad choices of 3rd-party libraries. Towards the middle of 2011 we decided to hold back with Scala for a few months and give it another try when the language, the community and tooling support become more mature.

I kept the flame going during most of 2011, checking tooling support and the language maturity often, migrating the one existing artifact to 2.9 when it came out. In the meantime, I kept programming in Java, but my coding style was not the same. I kept looking for ways to enforce immutability and to have functional or pseudo-functional transformations (turning to Google's Guava suite of libraries), and even wrote a small utility library for Option and Either in Java.

Finally, early in 2012 we decided it was time to try again. This time it was an immediate success. We wrote several of our core products in Scala, making heavy use of pattern matching, immutable value objects and collections and asynchronous execution using Futures and Promises. We now have about 50% of our codebase in Scala, lazily migrating existing Java code as part of the maintenance tasks, and have decided to use Scala exclusively for new projects.

##Spreading the word
One of the problems of being at the forefront of technology is having very few people you can consult with or come to for help, so very soon I started looking for other people who shared my passion for Scala. It was during the 2nd meetup of the [JJTV group](http://www.meetup.com/jjtv-il/) that I met Tomer Gabel, my partner in running Underscore. It soon became apparent that Tomer is far more experienced with Scala than I was at the time, so naturally it was to him I turned to help persuade my colleagues at Wix to give Scala a second chance. As time went by, I came upon some other avid Scala enthusiasts, mostly by chance.

There are two things you need to know about Israel: it's a small country with a small but very active software community, and Israelis are, let's say, not the most delicate of peoples. As a result of the two, the country is ideal as an incubator for new technologies and innovation. Recognizing this, Tomer and myself decided it was time to form a local group to help bring Scala users together and help interested parties at making the switch.

##Introducing Scalapeño
The next logical step was a conference. For this purpose, we contacted Typesafe and several leading Israeli companies for help and sponsorship and put out a call-for-papers in the local and international community. Eventually we came up with an impressive (we'd like to think so, at least) [agenda](http://www.2013.scalapeno.org.il/#!agenda/cjg9), including talks by Typesafe's very own [Stefan Zeiger](http://www.2013.scalapeno.org.il/#!database-access-with-slick/ch2a) and EPFL's [Eugene Burmako](http://www.2013.scalapeno.org.il/#!macro-writers-guide-210x-and-beyond/c134f), as well as leading Israeli Scala engineers.

By running the Scalapeño conference and the Underscore group, we hope to bring together local Scala developers, some of which may not even know other companies that have adopted the language, help raise awareness for Scala as a prime choice for new projects and bring it closer to the mainstream in the Israeli software industry. We're already seeing new companies paying attention to Scala and the birth of local Scala shops, and we have very high hopes for the future of Scala in Israel.

//reblogged from the [Typesage blog](http://www.lightbend.com/blog/scalapeno-the-israeli-international-scala-conference)
