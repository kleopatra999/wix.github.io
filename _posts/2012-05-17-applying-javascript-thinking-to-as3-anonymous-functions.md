---
layout: post
title: Applying Javascript thinking to AS3 - Anonymous functions
date: 2012-05-17 12:47:59.000000000 +03:00
type: post
published: true
status: publish
categories:
- ActionScript
- Flash
tags:
- Anonymous functions
- AS3
- Javascript
meta:
  _edit_last: '6'
  _syntaxhighlighter_encoded: '1'
author:
  login: roy.k@wix.com
  email: roy.k@wix.com
  display_name: roy.k@wix.com
  first_name: ''
  last_name: ''
---
When Wix started developing the HTML editor, many of the people whose full time job was AS3 development suddenly had to start developing in Javascript as well. We all dabbled in Javascript in our spare time, personal projects etc., but none of us had an opportunity to work full time on production quality code in Javascript before.
Interestingly, after some time in the new predicament, we all came up with the conclusion that there are a set of programming problems that are solved more elegantly when applying techniques that are more common to Javascript than to AS3. Specifically I'd like to discuss anonymous functions.

<script src="https://gist.github.com/WixAcademy/d3926c463606e71d49d9d58d4ee43527.js"></script>

We all knew about anonymous functions before, but we purposefully didn't use them. Our experience with passing around functions as arguments was that of hard to read and hard to debug code. To battle these shortcomings we reduced to a minimum our usage of function arguments. Where they had to be used we adopted a very verbose strategy. For example, when handling events, we'd create a skeletal event handler that simply called the function that does all the action, thus augmenting readability.

<script src="https://gist.github.com/WixAcademy/0b829ee2ef277e8a990239bd1926238e.js"></script>

In the above example, it is obvious from the code that clicking on the button opens a dialog. If the dialog's logic was inside the event handler, it may have taken some code reading to figure out what's happening. Worse still, if I decided to change the mouse click action but still wanted to retain the dialog opening logic, I'd have to start touching the dialog opening code to do so, risking bugs.

This frame of thought very often kept us with two degrees of separation from a chance to use anonymous functions. For the most part of our AS3 experience, we managed to do quite well without them. However, due to Javascript's nature, we continuously encountered problems in the new project that are solved much more elegantly with anonymous functions, and avoiding them became a serious burden.

##The case for Anonymous functions.
An Asynchronous action is a piece of code that executes independently of your normal application flow. Common asynchronous scenarios are a need to call a server, a need to delay an action, wait for some resource to load, etc.

Here's a simple piece of code, that synchronously creates a list of buttons from some sort of a description class.

<script src="https://gist.github.com/WixAcademy/5d9a7842b5fc5389f927cb740507b9a8.js"></script>

Now, for some reason, the **creator.create** function suddenly becomes asynchronous, so I'll have to rewrite the code to deal with this fact:

<script src="https://gist.github.com/WixAcademy/1090760f12acb261cfef647c106bdf5a.js"></script>

What's that? Suddenly I have a bunch of new field variables that weren't there before. In fact, for every piece of data that I am given in the **createButtons** function, I am going to need to remember it for the **onButtonCreated**. Worse still, if someone calls **createButtons** twice, before the loading is complete, I'm going to have to make sure that my new field variables support that. If they don't, I'm going to have to start thinking of a smarter loading system.

Now, let's see how the same code can be written using an anonymous function:

<script src="https://gist.github.com/WixAcademy/a0bc6a5c2024fb94d12248375c3004ed.js"></script>

Suddenly, the complexity is reduced almost to the same level of the synchronous approach. The reason for the complexity was that the asynchronous nature of **creator.create** made me break up my original function, and I had to keep its context alive somehow until the buttons finish loading. Using the closure nature of anonymous function, though, the context is automagically stored for me, and I can write the entire code snippet as one cohesive unit again.

In other words, it is often the case with asynchronous actions that the context in which I want to execute the delayed action is the same context in which I executed the original action. Anonymous functions let me keep that context.

Anonymous functions are a great tool to bridge the gap when we have an unnatural context switch. If we find that the callback function is a natural extension of the original function, or that we have to pass around or store many of our local variables in order to recreate the context in which we previously existed, it may be the case that an anonymous function will do the trick more elegantly.
