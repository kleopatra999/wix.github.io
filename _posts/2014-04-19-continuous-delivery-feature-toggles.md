---
layout: post
title: Continuous Delivery - Feature Toggles
date: 2014-04-19 11:38:13.000000000 +03:00
type: post
published: true
status: publish
categories:
- Web Development
tags: []
meta:
  _edit_last: '7'
  _sd_is_markdown: '1'
  _wpas_done_all: '1'
  foobar_type: default
  foobar_select: '0'
author:
  login: aviranm@wix.com
  email: aviranm@wix.com
  display_name: Aviran Mordo
  first_name: Aviran
  last_name: Mordo
---
One of the key elements in [Continuous Delivery](http://www.aviransplace.com/2013/03/16/the-roard-to-continues-delivery-part-1/) is the fact that you stop working with feature branches in your [VCS](https://en.wikipedia.org/wiki/VCS) repository; everybody works on the MASTER branch. During our transition to Continuous Deployment we switched from SVN to [Git](https://git-scm.com/), which handles code merges much better, and has some other advantages over SVN; however SVN and basically every other VCS will work just fine.

For people who are just getting to know this methodology it sounds a bit crazy because they think developers cannot check-in their code until it’s completed and all the tests pass. But this is definitely not the case. Working in Continuous Deployment we tell developers to check-in their code as often as possible, at least once a day. So how can this work? Developers cannot finish their task in one day? Well there are few strategies to support this mode of development.

##Feature toggles
Telling your developers they must check-in their code at least once a day will get you the reaction of something like “But my code is not finished yet, I cannot check it in”. The way to overcome this “problem” is with feature toggles.
[Feature Toggle](https://en.wikipedia.org/wiki/Feature_toggle) is a technique in software development that attempts to provide an alternative to maintaining multiple source code branches, called feature branches.

Continuous release and continuous deployment enables you to have quick feedback about your coding. This requires you to integrate your changes as early as possible. Feature branches introduce a by-pass to this process. Feature toggles brings you back to the track, but the execution paths of your feature is still "dead" and "untested", if a toggle is "off". But the effort is low to enable the new execution paths just by setting a toggle to "on".

**So what is really a feature toggle?**

Feature toggle is basically an “if” statement in your code that is part of your standard code flow. If the toggle is “on” (the “if” statement == true) then the code is executed, and if the toggle is off then the code is not executed.

Every new feature you add to your system has to be wrapped in a feature toggle. This way developers can check-in unfinished code, as long as it compiles, that will never get executed until you change the toggle to “on”. If you design your code correctly you will see that in most cases you will only have ONE spot in your code for a specific feature toggle “if” statement.

Feature toggles do not have to be Booleans. You can have feature toggles that are Enumerations, Strings, integers or any other value, as long as it fits your flow. For instance let’s say you want to migrate from one database to another. During the migration process the feature toggle can have 4 values:

1. read from the old database;
2. read from old database and fallback to new database;
3. read from new database and fallback to old database;
4. use new database only.

##Using feature toggles for quick feedback
There is another great advantage to Feature toggles. Not only do they use to check-in unfinished code, they also used for getting fast feedback.

Once a developer thinks a feature is finished, or even half-finished you can use the feature toggle to expose the new feature for internal testing or for getting quick feedback from product managers. For instance you can have in your “if” statement that checks if the user who is logged-in has certain privileges; or works at your company, or even equals to a specific user id, then the new feature is open and operational.

This way product managers can experience the new feature on production, on a live system very soon, even if it is not completed, and give the developer quick feedback about the product. While the product manager sees and experience the new feature, other users are not affected by this, because for them the feature toggle is “closed”.

##Internal Testing
When a developer declares that a new feature is finished we at Wix first open new features internally to all the employees in the company for internal testing. This way we use our own employees for QA, which gives us hundreds of QA users that act as just regular users of our system. After few hours of few days that we test new features internally, we open it to the general public (with or without [A/B test](http://www.aviransplace.com/2013/04/04/continuous-delivery-part-4-ab-testing/), depends on the use case).
 
##Refactoring using Feature Toggles
One other very useful use case for feature toggles is refactoring. Since all the developers are working on the MASTER branch, refactoring can be a challenge. But using feature toggles can ease the pain.

Usually when refactoring you change one or more method implementation, replace classes and even change an entire workflow. Now when using continuous delivery and your code has to be checked-in at least once a day, this affects how you refactor.

When doing a large refactoring job you **DO NOT** change any of the existing code. What you do is write a new (and improved) code that replaces the old code. Using feature toggles you control when to use the new and refactored code that lives alongside with the old and “not so good” code. Once you are done with the refactoring job and opened the feature toggle to use the new code, you can safely delete the old code from your system.

Using this method has a very important benefit, that as long as you do not delete the old code you can always go back to it (flipping the toggle) if you discover a bug in the new code on production.

##Feature toggle manager and BI
When you use feature toggle it is important to know which feature toggles are active, see what their values are, how long these are active and have the ability to make modifications to the toggles in real time.

For this job we at Wix built a library called Feature Toggle Manager (soon to be opened as open source). Feature toggle manager has a list of feature toggles and their values. It is backed by a database where we can modify the values via our back-office.

We use the feature toggle manager to provide the “if” statement in the code what is the value of a feature. The Feature Toggle Manager has a set of strategies that it acts upon to determine the toggle value. Some of the strategies we use are: User credentials, Wix employees, GEO location, Browser user-agent, and percentage. You can build your own strategies to determine which value the Feature Toggle Manager will return given a use case. It is important to have a default value for a feature, which defines the default behavior of your system. The default value can also change in time after a feature in mature.

Since every flow uses the Feature Toggle Manager to get the toggle value we can also report to our BI systems on every event which features (and their values) where active and passed in the current user flow.

##Cleaning feature toggles
Feature Toggles should not exist forever in your code. After a feature is opened and you decide there is no need to change the toggle back to inactive, developers should go back to the code and remove the “if” statement from the code, cleaning it from unnecessary if statements and unused toggles. A Feature toggle manager can help you with that since it shows you all the features and how long they are active. Also you can do a quick search in the code to find the places feature toggles are used.

##Testing with feature toggles
Testing features can be a challenge. Remember, doing Continuous Delivery means that you have to work using Test Driven Development. Usually with unit test you would not have any problems, because you test the actual methods, and in most cases bypassing the feature toggle flow management. However when you write your [integration tests](http://en.wikipedia.org/wiki/Integration_testing) you may have a problem, since you are testing end to end flows and have to pass through the Feature Toggle “if” statement, when it is both “closed”, to test regression, and “open” to test the new feature flow.

This is another case where Feature Toggle Manager can help you. In your tests during setup you can set the values in the Feature Toggle Manager to whatever flow you are testing. Since Feature Toggles always have default values (that are usually off) all the old tests should work as before, since you do not change the old behavior. However when you write integration tests for the new feature you need to set the feature toggle to “on” during your test setup and thus enable the flow go through the new feature and test that too.

Original post, as published on Avirans blog: [Continuous Delivery - Feature Toggles](http://www.aviransplace.com/2013/03/27/continuous-delivery-part-3-feature-toggles)
