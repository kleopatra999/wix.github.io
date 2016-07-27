---
layout: post
title: The road to continuous delivery
date: 2013-10-02 22:21:58.000000000 +03:00
type: post
published: true
status: publish
categories:
- Tips and Tricks
tags:
- continuous delivery
meta:
  _edit_last: '7'
  foobar_type: default
  foobar_select: '0'
  _wpas_done_all: '1'
author:
  login: aviranm@wix.com
  email: aviranm@wix.com
  display_name: Aviran Mordo
  first_name: Aviran
  last_name: Mordo
---
The following series of posts are coming from my experience as the head of back-end engineering at Wix.com. I will try to tell the story of Wix and how we see and practice continuous delivery, hoping it will help you make the switch too.

So you decided that your development process is too slow and thinking to go to continuous delivery methodology instead of the “not so agile” [Scrum](https://en.wikipedia.org/wiki/Scrum_(software_development)). I assume you did some research, talked to a couple of companies and attended some lectures about the subject and want to practice continuous deployment too, but many companies asking me how to start and what to do?

In this series of articles I will try to describe some strategies to make the switch to Continuous delivery (CD).
Continuous Delivery is the last step in a long process. If you are just starting you should not expect that you can do this within a few weeks or even within few months. It might take you almost a year to actually make several deployments a day.

One important thing to know, it takes full commitment from the management. Real CD is going to change the whole development methodologies and affect everyone in the R&D.

##Phase 1 – Test Driven Development
In order to do a successful CD you need to change the development methodology to be Test Driven Development. There are many books and online resources about how to do TDD. I will not write about it here but I will share our experience and the things we did in order to do TDD. One of the best books I recommend is “[Growing Object Oriented Guided by tests](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627?ie=UTF8&camp=1789&creative=9325&creativeASIN=0321503627&linkCode=as2&redirect=true&ref_=as_li_qf_sp_asin_il_tl&tag=aviransplace-20)”.

A key concept of CD is that everything should be tested automatically. Like most companies we had a manual QA department which was one of the reasons the release process is taking so long. With every new version of the product regression tests takes longer.

Usually when you’ll suggest moving to TDD and eventually to CI/CD the QA department will start having concerns that they are going to be expandable and be fired, but we did not do such thing. What we did is that we sent our entire QA department to learn Java. Up to that point our QA personnel were not developers and did not know how to write code. Our initial thought was that the QA department is going to write tests, but not Unit tests, they are going to write Integration and End to End Tests.

Since we had a lot of legacy code that was not tested at all, the best way to test it, is by integration tests because IT is similar to what manual QA is doing, testing the system from outside. We needed the man power to help the developers so training the QA personal was a good choice.
Now as for the development department, we started to teach the developers how to write tests. Of course the first tests we wrote were pretty bad ones but as time passes, like any skill, knowing how to write good test is also a skill, so it improves in time.

In order to succeed in moving to CD it is critical to get support from the management because before you see results there is a lot of investments to be done and development velocity is going to sink even further as you start training and building the infrastructure to support CD.

We were lucky to get such support. We identified that our legacy code is unmaintainable and we decided we need a complete re-write. However this is not always possible, especially with large legacy systems so you may want to make the switch only for new products.

So what we did is we stopped all the development of new features and started to progress in several fronts. First we selected our new build system and CI server. There are many options to choose from, we chose [Git](https://git-scm.com/), [Maven](http://maven.apache.org/), [TeamCity](http://www.jetbrains.com/teamcity/whatsnew/) and [Artifactory](https://www.jfrog.com/open-source/#os-arti). Then we started to build our new framework in TDD so we could have a good foundation for our products. Note that we did not anything that relates to deployment (yet).

Building our framework we set few requirements for ourselves. When a developer checks our code from Git he should be able to run unit test and integration tests on his own laptop WITHOUT any network connections. This is very important because if you depend on fixtures such as remote database to run your IT, you don’t write good integration tests, limit to work only from the office, your tests will probably run slower and you will probably get into trouble running multiple tests on the same database because tests will contaminate the DB.

Next chapter &raquo; [Production visibility](_posts/2013-11-03-continuous-delivery-production-visibility.md)

Original post &raquo; [The road to continuous delivery](http://www.aviransplace.com/2013/03/16/the-roard-to-continues-delivery-part-1/)
