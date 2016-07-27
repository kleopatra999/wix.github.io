---
layout: post
title: Integration Tests under Node.js Environment using a mock server
date: 2013-03-01 00:13:07.000000000 +02:00
type: post
published: true
status: publish
categories:
- JavaScript
- Web Development
tags:
- integration tests
- Javascript
- nodejs
- source
meta:
  _edit_last: '13'
  _syntaxhighlighter_encoded: '1'
  _wpas_done_all: '1'
author:
  login: nadavl@wix.com
  email: nadavl@wix.com
  display_name: nadavl@wix.com
  first_name: ''
  last_name: ''
---
This week, I was handed a nice task - to integrate with some external service we use, that has no API. All communication with the service was supposed to be mimicking a multiple step scenario of a user integrating with some forms. This means, cookies, sessions, and all the wonders of HTTP protocol.
And, just to add giggles, the whole component is to be written in and act as a part of a NodeJS server.

So, I thought to myself, first thing first; I configured a new [NodeJs](https://nodejs.org/en/) project with a Jasmine test environment, and started writing my integration tests.
But unfortunately, not only my remote service had no API, there was no way I could create an embedded local service for me to test against!

Popped up [Fiddler](https://www.telerik.com/download/fiddler) (or [Charles](https://www.charlesproxy.com/), whatever..) and sniffed the HTTPS traffic as I filled in the forms (Fiddler does it quite elegantly), and created a spec, specifying how should each and every packed look like.
To test it, I created a little HTTP service module, that can store its last request and even stub a response behavior.

It supports HTTP and HTTPS, and made my life easy.

##Here is some usage examples

Setting it up:

```javascript
beforeEach(function(){
	server = new TestableServer(3030);
	server.respondWithStatus(302);
	server.start();
});
afterEach(function(){
	server.stop();
});
```

And making the actual test:

```javascript
describe("when executing",function(){
	it("should create the right request to the service",function(){
		cmd.execute( buildTestRequestData(email,session) ,function(){});
		waitsFor(function() {
			  return server.lastRequest != null;
		}, "a request to arrive" , 1000);
		runs(function(){
			expect(server.lastRequest.body["email"]).toBe(email);
			expect(server.lastRequest.headers[SESSION_COOKIE_NAME]).toBe(session);
		});
	});
});
```

You are more then welcome to grab the source code here: [TestableServer.js](https://gist.github.com/WixAcademy/5297f190c756b0968b94d9a08f853f25)
