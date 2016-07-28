---
layout: post
title: Building and Open-Sourcing Wix's A/B Testing System
date: 2015-01-26 21:56:11.000000000 +02:00
type: post
published: true
status: publish
categories:
- TDD
- Tips and Tricks
- Web Development
tags:
- a/b tests
- continuous delivery
- open source
- tdd
meta:
  _edit_last: '7'
  _yoast_wpseo_focuskw: a/b testing
  _yoast_wpseo_linkdex: '73'
  _thumbnail_id: '798'
author:
  login: talyag@wix.com
  email: talyag@wix.com
  display_name: Talya Gendler
  first_name: Talya
  last_name: Gendler
---
Have you ever worked using [Continuous Delivery](https://en.wikipedia.org/wiki/Continuous_delivery) (CD)? You know, that process where you push the code, run it through an automatic build process, and just deploy the changes to production?

It’s really great because your code is pushed to production immediately. This means you can try experimental features on your users and get immediate feedback. But it can also backfire because bad code gets deployed to production immediately as well! Moreover, that experimental feature that you thought was great but turned out to be bad...

Well, you just exposed it to all your users!

Because of the dangers of bad code getting pushed to production and wreaking havoc, an **experiment system** (for a/b testing and feature toggles) [is essential to the well being of a system that uses CD](http://www.aviransplace.com/2013/03/27/continuous-delivery-part-3-feature-toggles/). An experiment system enables you to mark pieces of code as “experimental”, push it to production, and toggle it on or off as much as you like. Moreover, you can toggle it on or off for a certain subset of your users, and thus test your supposedly great feature on a small subset of users before releasing it at large.

After going through two previous versions of experiment systems, we decided to build the third one from scratch, building on the [experience](http://www.aviransplace.com/2013/04/04/continuous-delivery-part-4-ab-testing/) that was gained over several years of managing an experiment-driven development process. Thus we set out to write [PETRI](http://wix.github.io/petri/), our Product Experiments and Toggles Report Infrastructure.
 
##Creating PETRI as a TDD Project
We planned to open source PETRI from day one, but in the interest of development velocity, we developed it as an internal project with our own internal dependencies. Yet we knew that in order to finally break away from those internal dependencies we would need a development methodology that would enable us to make those big changes while still being able to build quickly and confidently. That methodology is Test-Driven Development (TDD), practiced by many teams at Wix.

Given that almost every service at Wix would be using this project, we also knew that we would need to do this [by the book](http://www.growing-object-oriented-software.com/). Thus we had the amazing opportunity to write a greenfield project, completely TDD-ed from the get-go.
 
##Introduction to PETRI
To understand PETRI you must be familiar with experiment systems, so let’s first define some terminology and concepts.

* **Experiment**: A method of modifying a system’s behavior based on some request context—for example, the user’s language.
* **A/B test**: A stateful experiment that keeps track of the participants—for example, testing a new version of a landing page on 20% of users in the U.S.
* **Feature Toggle/Flag**: A stateless experiment—for example, testing some new API that has no noticeable effect by users.

In PETRI, every feature toggle and A/B test is represented by an object called [Experiment](https://github.com/wix/petri/blob/master/wix-petri-core/src/main/java/com/wixpress/petri/experiments/domain/Experiment.java), which holds a list of **eligibility filters**. These filters determine whether a given user/context should be included in the experiment; for example, filter by language, by geographical location, by user id, or by registration date.

An experiment usually has two possible values: one for the old behavior (A) and one for the new (B). If a user/context is eligible for an experiment, it will receive either A or B, according to the percentage defined in the experiment. If the user/context is not eligible, the fallback value will be used, usually meaning A. When a user receives B, we call the experiment “on” for that user.
 
##PETRI’s Design
PETRI consists of two parts: a PETRI server, which manages and stores all the experiments; and a PETRI client library called Laboratory.

![Petri Schema](../Images/Building-OpenSourcing-Petri/PetriSchema.png)

Laboratory retrieves the active experiments from PETRI server and conducts the experiments. All the business logic of the tossing algorithm and filtering by user/context is run from Laboratory, which is embedded in the client application.
Laboratory’s main responsibility is to extract certain request/client contexts for filtering and conduct experiments on them; for example, extracting the Accept-Language header from an HTTP request for language filtering.

##Open-Sourcing PETRI
To be able to break away from our internal dependencies, we built PETRI from a few core modules—which are used both in the public [GitHub](https://github.com/wix/petri) repository and in our internal one—and from additional modules that provide integration with our proprietary internal systems.

The internal “Wix integration” modules integrate PETRI into these systems including configuration, packaging, mail sending, error reporting to multiple systems, and—most importantly—integration with our custom request lifecycle, which includes adapters to our HTTP request lifecycle and RPC implementation.
For the open source project we implemented the servlet-api integration module, which provides the same kind of adapters for any servlet-api based application. This enables any application that uses this module to be “context aware”, allowing calls to the [Laboratory API](https://github.com/wix/petri/blob/master/wix-petri-core/src/main/java/com/wixpress/petri/laboratory/Laboratory.java) directly from the application code. See the concise [Sample PETRI](https://github.com/wix/petri/tree/master/sample-petri-app) App for reference.

This is where TDD-ing from the beginning really paid off (in addition to the other [benefits](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)). Remember that we started open sourcing the project after it had already been in full-production use at Wix for a few months. So the beautiful part of this process was that, even at this point, the implementation of the servlet-api integration module and the final separation of all modules was almost painless—with the bonus of being a really fun exercise.
 
##What It Looks Like in Practice
For a good example of how this actually works, see the contract test for PETRI server. The project has two implementations. One is the [RAMPetriClientTest](https://github.com/wix/petri/blob/27c89cb406c162c45e9071c99c1f33d6b5a8acdd/wix-petri-server/src/test/java/com/wixpress/petri/petri/RAMPetriClientTest.java), which makes sure the [Fake Test Double](http://www.martinfowler.com/bliki/TestDouble.html) we use for testing the clients is a proper substitute for the actual server. The second is the RPCPetriServerTest, in which we test the actual server against an in-memory DB (H2).

When we open sourced the project, we already had these two types of tests in our code base, which made implementing the RPCPetriServerTest for the open source project very easy.

A second benefit of having this [fake server](https://github.com/wix/petri/blob/6c0739dc6780cbb6509c964694963398f83f1b78/petri-servlet-api-integration/src/it/java/com/wixpress/petri/test/FakePetriServer.java) ready at hand was that it made it easy to implement the [integration test for the servlet-api integration client](https://github.com/wix/petri/blob/6c0739dc6780cbb6509c964694963398f83f1b78/petri-servlet-api-integration/src/it/java/com/wixpress/petri/test/LaboratoryIT.java).

![Petri Schema 2](../images/Building-OpenSourcing-Petri/PetriSchema2.png)

##The Importance of Forward Compatibility
[Backward **AND** forward compatibility](v) are a must when you practice Continuous Delivery and deploy (or rollback) to a cluster of machines. The reason is that, at any given time, two versions could be live simultaneously.
While it is very important for all of our services, it is that much more important when developing a library used by all these services. The impact of not properly handling backward and forward compatibility can be much more disastrous, and it is magnified when you can't just rollback your own single service.

Remember that PETRI experiments hold a list of eligibility filters. Experiments are serialized and deserialized between the server and clients, and as with most data we have, they ignore unknown fields in order to be forward compatible. When first implementing this, we forgot about dealing with new filters—that is, filters created by a newer version of our code that were being sent to old clients.

Once we deployed the server and created the first instance of a new type of filter, we started receiving deserialization errors from all the services that had not yet been deployed. This meant that all those services were stuck with the latest successful list of experiments and could not receive any updates.
The immediate mitigation was simply to terminate the experiment with the new type of filter. Since PETRI server only sends active experiments to each client, this eliminated the errors almost immediately.

We understood that there was a real problem here, since the obvious solution (ignoring unknown filter types) is not good enough. This is because not all services are deployed at the same time, and we could not rely on asking everyone to deploy before introducing a new type of filter.

The solution we reached is the concept of the [UnrecognizedFilter](https://github.com/wix/petri/blob/493d70e67e0249862f2247f118e1bd043c4b6e9b/wix-petri-core/src/main/java/com/wixpress/petri/experiments/domain/UnrecognizedFilter.java) — any unrecognized type of filter gets deserialized into this. Experiments containing an UnrecognizedFilter are considered invalid (as in, no user is ever eligible for the experiment), and when an experiment that contains one is actually conducted, an error is reported and the user receives the fallback value. This way we make sure that no unrecognized filter can cause a user to be included in an experiment by mistake, and that the service owners are notified that their client is too old (if they try to conduct this specific experiment).
 
##Want to Learn More?
Watch the [QCon talk](https://www.infoq.com/presentations/experimenting-humans) for many more detailed war stories and insights into our experiment system, as well as how we practice experiment-driven development at Wix. You can also read [the wiki](https://github.com/wix/petri) for more topics and best practices on using experiment systems.
