---
layout: post
title: Build Your Own Chrome Extension
date: 2015-07-19 17:15:14.000000000 +03:00
type: post
published: true
status: publish
categories:
- JavaScript
tags: []
meta:
  _edit_last: '34'
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: build your own chrome extension
  _yoast_wpseo_metadesc: How to build your own Chrome extension. Its easy and simple.
    This posts gets you started with the basics, and shows you some useful tips.
  _yoast_wpseo_linkdex: '85'
author:
  login: Amit Shvil
  email: amits@wix.com
  display_name: Amit Shvil
  first_name: Amit
  last_name: Shvil
---
Build Your Own Chrome Extension
The Services Team at Wix uses JIRA as our Scrum board, which is displayed on a big TV in our team's room. We love JIRA because it's robust and versatile, but we couldn’t find a simple feature that we needed: displaying the sum of the points of each column, as well as the total points on the board. Having that feature would make the Scrum much easier.

Before JIRA I worked with Trello, which had that exact feature, called [SCRUM for Trello](https://chrome.google.com/webstore/detail/scrum-for-trello/jdbcdblgjdpmfninkoogcfpnkjmndgje?hl=en). I decided to develop one for JIRA, and after a few hours' work it was done.
In this post, I want to share with you how easy it is to build a Chrome extension. I’ll cover the basic steps you need to get started, as well as guide you through my code for creating this specific extension for JIRA. (If you need the JIRA extension I developed, install it [here](https://chrome.google.com/webstore/detail/jira-total-board/lakifbfoaoncjjcinclbfegedhmhndhd?hl=en-US).)

##Step 1: Installing Yeoman Generator for Chrome Extensions
Yeoman is a "scaffolding tool for modern web apps", meaning that it provides various frameworks and helpers for all kinds of web projects. They have one for [Chrome extensions](https://github.com/yeoman/generator-chrome-extension) as well.

First, make sure that you have Node.js and npm installed.
Install Yeoman using the following command:

```bash
$ npm install -g yo
```

And then install the Chrome Extension generator:

```bash$ npm install -g generator-chrome-extension```

Use Yeoman to create a boilerplate for the extension:

```bash$ yo chrome-extension```

Now you have templates for all the files you need for the extension.

##Step 2: Loading Your Extension to Chrome
These are the steps you need to follow:

1. Type chrome://extensions in the address bar.
2. Select the "Developer mode" checkbox.
3. Click the "Load unpacked extension..." button.
4. Choose your extension's directory.

Now you’re ready to start coding.

##Step 3: Coding
To get started, download our [JIRA extension code](https://github.com/wix/jira-total-board) from GitHub for reference.
First, configure the manifest.json file (located in the app folder). The two relevant nodes are in "content_scripts":

* "matches": Specifies the pattern of URLs this extension will run on. We wanted to run our extension on JIRA only, so we chose ["*://*.jira/*"].
* "js": Indicates which files the extension will be using. In our case, it's
 * ```bash["scripts/jquery.js","scripts/jira-scrum.js"].```


Now for the code itself, take a look at scripts/jira-scrum.js.

Our starting point is the document.ready event, in which we call setInterval to run our main function, calc() every 3 seconds.

In calc() we scan the DOM to find all the relevant columns and get the sum of their points, which we update in createTotalDisplay().

Here is the code for calc with comments:

```javascript
function calc() {
     var totalBoard = 0;
     // get a list of columns id
      var columnsId = buildColumns();
     // loop on column
      for (var i = 0, len = columnsId.length; i &lt; len; ++i) {
        //run on all the cards in the column
         var totalCol = sumCol(columnsId[i]);
        //getting the column header
         var element = $('.ghx-column[data-id=' + columnsId[i] + ']');
        // adding that number to the header
         var totalEle = createTotalDisplay(totalCol, element);
        // adding it to do dom
         element.append(totalEle);
        //sum the total of the Board
         totalBoard = totalBoard + totalCol;
    }
    //adding the total of the Board
     var totalEle = createTotalDisplay(totalBoard, $('#ghx-board-name'));
    $('#ghx-board-name').append(totalEle);
}
```

##Step 4: Debugging
Debugging is easy: just open [Chrome DevTools](https://developer.chrome.com/devtools), press Ctrl+O, look for the file (in our case jira-scrum.js), and now debug it as you would for any web app.
When developing Chrome extensions, it’s important to know that both the Chrome code and the page code share the same DOM, but they are run in different sandboxes.

##Step 5: Publishing
For just $5 you can open a [Google Developer Account](https://chrome.google.com/webstore/developer/dashboard) and publish your extension for the world to enjoy!
