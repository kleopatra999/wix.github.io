---
layout: post
title: 'ESLint Plugins: Plug into a Better Coding Culture'
date: 2015-09-24 11:18:26.000000000 +03:00
type: post
published: true
status: publish
categories:
- JavaScript
- opensource
- Tips and Tricks
tags:
- eslint
- esprima
- Javascript
- lodash
- npm
- opensource
meta:
  _edit_last: '8'
  _yoast_wpseo_focuskw: eslint plugins, Lodash, javascript
  _yoast_wpseo_linkdex: '60'
  _yoast_wpseo_title: 'ESLint Plugins: Plug into a Better Coding Culture'
  _syntaxhighlighter_encoded: '1'
author:
  login: Omer Ganim
  email: omerga@wix.com
  display_name: Omer Ganim
  first_name: Omer
  last_name: Ganim
---
When writing code, it’s a good idea to use a code linting tool for several reasons: it identifies possible errors, enforces a clear coding style, and prevents engineers from using antipatterns. Linting tools are able to achieve all this without actually running your code or caring about what it does. This is particularly important for JavaScript, since any errors in the code would otherwise only be caught at runtime, and might reach the users.

Here at Wix we use [ESLint](http://eslint.org/) for JavaScript because it’s highly configurable and extensible. You can choose not to run some rules and not to fail on some errors, and you can even create your own rules via ESLint plugins, which is exactly what we have done. In this post I’ll explain why we wrote an ESLint plugin, as well as how to structure and test the rules. 

##Using Lodash, in Style
We got the idea to write an ESLint plugin for Lodash while we were upgrading some of our projects to the latest major version of [Lodash](https://lodash.com/) (version 3). Some changes in Lodash were not backward-compatible, which forced us to make changes in our code. In the process, we reviewed our usage of Lodash and encountered code that, while valid, was muddled and unclear.

Here’s a contrived example that demonstrates such unclear code:

```javascript
var obj = _.object(_.map(_.filter(params.split(‘;’),
  function(x) {  
    return !!x;
  }),
  function(param){  
    return param.split(‘:’);
  }));
```

So, we devised a set of rules to prevent code like this from entering our code base ever again. Enter [eslint-plugin-lodash3](https://www.npmjs.com/package/eslint-plugin-lodash3). As you can see, this code is perfectly valid, as far as the rules of vanilla ESLint are concerned. Semicolons galore, correct spacing…

but can you figure out what this code actually does? Somewhere between the third or fourth method call it’s become unclear which callback is which.
The plugin identified several problems in the code sample above, and after we refactored the code to fix its violations, what came out looked something like this:

```javascript
var obj = _(params)
  .split(‘;’)
  .compact()
  .invoke(‘split’, ‘:’)
  .zipObject()
  .value();
```

What’s great about ESLint rules in general, and this plugin in particular, is that it only reports violations—the engineers have to fix the violating code, as we did in the above example. By seeing the errors and having to fix the code themselves, this is a great way for them to learn about our particular coding style and culture.

Other than fixing some basic style issues, this particular plugin enables developers to get to know some of the less-trivial methods and finer points of Lodash, such as using the _.invoke method, and which methods end an implicit Lodash chain.

##Writing an ESLint Plugin
ESLint makes writing and testing rules really easy. To start, you can look at an existing plugin or use the [Yeoman generator](https://github.com/eslint/generator-eslint) that the ESLint project recommends. 

##Structuring a Rule
The rules themselves are tree-visitors over each script file’s Abstract Syntax Tree (AST), so we found it easiest to use [Esprima’s Online Parser](http://esprima.org/demo/parse.html) to check our code samples’ structure.

A rule’s structure looks something like this:

```javascript
module.exports = function (context) {
  return {
    "AstNodeType": function (node) {
      if(condition) {
        context.report(someNode, errorMessage, optionalTemplateObject);
      }
    }
  }
}
module.exports.schema = [
  // JSON Schema for rule options goes here
]
```


Here’s an example of an ESLint violation report statement:Each rule’s implementation is a Node.js module that exports a function. The function itself gets the context (through which we report errors and get additional data) and returns an object that adds visitors to the AST traversal. The object has a key for each node type that’s significant for the rule, as well as another visitor upon “exiting” that node (after visiting all its children). In some visits, under certain conditions, the code should report an ESLint violation.

Each violation is reported on a specific node, with a templated string as the message. Variables are enclosed in double curly braces, {{ }}. 

```java
context.report(node, ‘Do not use .value() after chain-ending method {{method}}’,
{method: method});
```


As for testing, [ESLint’s Rule Tester](http://eslint.org/docs/developer-guide/working-with-plugins#testing) makes it natural to write the rules in a TDD style: The tester simply runs against some samples of invalid code and some samples of valid code. With the correct test cases, it’s easy to get 100% code coverage over all possible branches of code.

##Try It Out
For actual samples of both rules and tests, check out [the open-sourced code](https://github.com/wix/eslint-plugin-lodash) for our plugin, and see just how easy it is to use ESLint plugins to make sure your shared code is up to snuff. You can also write your own ESLint plugins or contribute to ours!
 
