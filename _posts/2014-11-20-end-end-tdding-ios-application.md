---
layout: post
title: End-to-End TDDing an iOS Application
date: 2014-11-20 11:00:27.000000000 +02:00
type: post
published: true
status: publish
categories:
- iOS
- Scala
- TDD
tags: []
meta:
  _edit_last: '5'
  _yoast_wpseo_focuskw: ios tdd
  _yoast_wpseo_linkdex: '59'
  _oembed_ec387459903f3854611cccafc761f06c: "{{unknown}}"
  _oembed_eae529dfee7135dc0562f423976140dd: "{{unknown}}"
  _oembed_264b655a7b05ce615df885654fc0ddd9: "{{unknown}}"
author:
  login: shaiy@wix.com
  email: shaiy@wix.com
  display_name: Shai Yallin
  first_name: Shai
  last_name: Yallin
---
Recently we prototyped the development of a native OS application that needed to talk to multiple backend services. Although the project never took off, we tackled lot of the problems that seem to scare people off of TDD and CI/CD for iOS.

##Walking Skeleton: iOS App
As avid TDD practitioners, we decided to do this [by the book](http://www.growing-object-oriented-software.com/), starting with a walking skeleton. The first order of business was writing a failing test expecting a single-view app displaying some text. We decided to go with [Appium](http://appium.io/) as a driver for UI automation, writing our tests in Python. Our goal was to automate as much of the build process as possible so that it could run under a freshly-provisioned build agent on CI with minimum manual installations. We ended up with a [shell script](https://github.com/electricmonk/appium-ios-python-e2e-tests/blob/master/e2e/run-e2e.sh) that does the following:

* Install node.js using [Homebrew](http://brew.sh/)
* Install Appium using [npm](https://www.npmjs.com/)
* Patch Appium to fix a bug blocking it from running on OS X Yosemite (the issue was supposedly fixed in Appium 1.3.2, but we never got around to testing it).
* Create a new Python [virtualenv](http://virtualenv.readthedocs.io/en/latest/) and switch to it
* Install [Nose](https://nose.readthedocs.io/en/latest/), [PyHamcrest](https://pypi.python.org/pypi/PyHamcrest) and [appium-client](https://github.com/appium/python-client) using pip
* Start the Appium server
* Run the tests using Nose
* Shut down the Appium server

The end result was script that only depends on a Mac machine with the following installed:

1. OS X
2.  Xcode 6 + iOS SDK
3. Homebrew
4. Python Virtualenv (which needs to be installed using sudo, so it cannot be run by the script)

##Bootstrapping the Server-Side
Early on, we made a design decision to create a single backend façade that the app would talk to, hiding the details and topology of the various micro-services actually responsible for the different domains. We started by creating a simple Python-based web server that the E2E test accessed to stub the expected value. This allowed us to complete the first cycle where by running the aforementioned script, the Python E2E ran and passed successfully. The next step was to actually write the real backend façade in [Scala](http://www.scala-lang.org/).

However, it doesn't make sense to run a complete E2E from the app, through the façade, to the backend micro-services, since this makes the scope of development, tests, and build large and cumbersome. We decided to treat the backend micro-services as third party APIs, thus making our façade a [Simplicator](http://www.natpryce.com/articles/000785.html).

A direct result of this was a decision to write a separate iOS library that would serve as a client of this façade, and to build and test both in a separate project. This client library would then be delivered to the native app using the [Cocoapods](https://cocoapods.org/) dependency management system.

Having made this decision, the obvious course of action was refactoring out the logic that would make up the client library into a separate project. We wrote a simple layer of contract tests that run against the library, providing the appropriate failing tests to prompt us to write the server. The server was written as the simplest possible RESTful API with no external dependencies whatsoever; data would be stored in-memory and would be gone as soon as the server shuts down. This would hold until a later stage when we would replace the in-memory repositories with RPC services talking to the backend micro-services.

Running these contract tests wasn't a simple task. The whole thing needed to run as a Maven build, triggered by our build server ([TeamCity](https://www.jetbrains.com/teamcity/)), on a specially-configured Mac-based build agent. This Maven build would build the server, start it, and then run the integration tests against it. However, iOS tests need to run via xcodebuild. Now, we could've used a separate build step in TeamCity to run these tests, but that would make the build itself less self-contained.

Instead, we ended up using a combination of Maven's [dependency plugin](http://maven.apache.org/plugins/maven-dependency-plugin/) to retrieve the latest server version (presumably the one that was just built), and a [shell script](https://gist.github.com/electricmonk/2e25fac43556eecdae30) that starts up this server in the background, waits for it to be ready and then run the *xcodebuild* command line tool.

One interesting issue we ran into was that even though the library doesn't contain any UI, xcodebuild insists on running it in an iPhone Simulator. The TeamCity agent, installed as a background process on our Mac build machine, did not have permission to start up GUI processes, which resulted resulted in weird errors such as "could not start iPhone Simulator: segmentation fault 11". Eventually, by cross-referencing with Jenkins-related issues, we realized that the agent needs to run as a [LaunchAgent](https://developer.apple.com/library/mac/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html), which we configured by help of [this wiki page](https://confluence.jetbrains.com/display/TCD8/Setting+up+and+Running+Additional+Build+Agents#SettingupandRunningAdditionalBuildAgents-UsingLaunchDaemonsStartupFilesonMacOSx).

##Last Words
Sadly, the project was shelved at this stage; we had some functioning screens in the app and an in-memory server returning three types of domain objects, but no further code has been developed. However, we've proven that doing end-to-end TDD on iOS projects with a JVM-based backend is feasible and actually quite simple - despite some particularly annoying caveats.

##Resources
You can find the result of [our experimentations here](https://github.com/electricmonk/appium-ios-python-e2e-tests)

