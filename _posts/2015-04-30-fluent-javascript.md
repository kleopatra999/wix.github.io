---
layout: post
title: Fluent JavaScript
date: 2015-04-30 14:27:04.000000000 +03:00
type: post
published: true
status: publish
categories:
- JavaScript
- Web Development
tags:
- client
- FED
- Javascript
- js
meta:
  _edit_last: '29'
  _syntaxhighlighter_encoded: '1'
  _thumbnail_id: '706'
  _yoast_wpseo_focuskw: Fluent JavaScript
  _yoast_wpseo_linkdex: '81'
  _yoast_wpseo_metadesc: Writing fluent JavaScript interfaces that end up with code
    that can be read like natural language
author:
  login: Nikas
  email: nikasp@wix.com
  display_name: Nikas Praninskas
  first_name: Nikas
  last_name: Praninskas
---
It is not enough for code to simply work. Good code is meant to be easy to understand, and it is much easier to understand code that is readable.

##Comments Considered Harmful
Traditionally, algorithms have often been explained in [large comment blocks](https://github.com/angular-ui/ui-router/blob/3da0a17069e27598c0f9d9164e104dd5ce05cdc6/src/state.js#L1082). The notion that writing many comments makes code easier to understand is still quite prevalent in the industry. Yet when it comes to code, less is very often more.

Good comments are to the point and explain the why, not the how:

```javascript
// bad
$scope.model = _.extend({}, modelMap); // reset $scope.model
// good
function partialUpdateReview(review, publishedAt) {
  // TODO: use POST until API supports PUT
  return $http.post('/api/reviews/published', {publishedAt: publishedAt});
}
```

Good code has to be obvious, and you do not need to explain that which is obvious. Nearly every comment you write is a failure to write clear and understandable code. Good code, simply put, is self-documenting.

This leaves us with explaining the how. One way to make code readable is to have it flow like the natural language, describe the algorithm in a higher level of abstraction. This leaves the implementation open to explore to those who desire details, yet hides it from those who simply wish to get the gist.

##Fluent JavaScript
The main goal of writing [Fluent interfaces](http://martinfowler.com/bliki/FluentInterface.html) is to end up with code that can be read like natural language, thus removing the need for superficial comments.
That is, instead of this:

```javascript
insertIntoAfter(2, [1, 3], 1); //[1, 2, 3]
```

We have something like this:

```javascript
insert(2).into([1, 3]).after(1); //[1, 2, 3]
```
The fluent version basically reads like a natural language sentence, which makes it very easy to understand. This is especially useful in functions that take more than a few arguments - the regular way devolves into a soup of obscure parameters, reminiscent of the [Polish notation](https://en.wikipedia.org/wiki/Polish_notation), while the fluent interface remains highly readable at a glance.
Fluent interfaces are nothing groundbreaking. They are, essentially, a form of [domain-specific languages](https://en.wikipedia.org/wiki/Domain-specific_language). In fact, most of BDD style testing libraries use some sort of fluent API. For example:

###expect.js

```javascript
expect(window.r).to.be(undefined);
expect({ a: 'b' }).to.eql({ a: 'b' })
expect(5).to.be.a('number');
expect([]).to.be.an('array');
expect(window).not.to.be.an(Image);
```

###Jasmine matchers

```javascript
expect(a).toBe(b);
expect(a).not.toBe(null);
```

###should.js

```javascript
obj.should.have.property('id').which.is.a.Number;
obj.should.have.property('path');
```

The prevalence of these types of interfaces in places where readability is extremely important (unit tests can be considered a type of documentation) is a signal that this works well in practice.
Sold, what now?
Even if you are not writing public facing libraries, a touch of readability in internal code never hurt anyone. Writing fluent APIs and functions is actually relatively straightforward, if a little clunky even in vanilla JavaScript.

##Vanilla JavaScript
One idea of implementing fluent functions in vanilla JS relies on returning objects with a single property (that is, the next function to chain while using it) while relying on closures to hold intermediate parameters.


```javascript
function insert(value) {
  return {into: function (array) {
    return {after: function (afterValue) {
      array.splice(array.indexOf(afterValue) + 1, 0, value);
      return array;
    }};
  }};
}
insert(2).into([1, 3]).after(1); //[1, 2, 3]
```

This is actually not too bad, but it can be a little overwhelming due to so many function and return keywords everywhere.
ES6 lets us write this in a more concise way, at the cost of introducing some crazy punctuation:

```javascript
let insert = (value) => ({into: (array) => ({after: (afterValue) => {
  array.splice(array.indexOf(afterValue) + 1, 0, value);
  return array;
}})});
insert(2).into([1, 3]).after(1); //[1, 2, 3]
```

Another, slightly more limiting option is to forego function composition entirely and just go with a single parameters object and one function that can handle it all:

```javascript
function insert(params) {
  var array = params.into,
      value = params.value,
      afterValue = params.after;
  array.splice(array.indexOf(afterValue) + 1, 0, value);
  return array;
}
insert({value: 2, into: [1, 3], after: 1}); //[1, 2, 3]
```

Writing simple fluent interfaces is clearly possible even in plain old JavaScript. If we're only creating a few fluent functions here and there, it's probably the best approach. However, if we were to adopt the fluent interface as a common pattern in a codebase, we'd quickly run into the same readability issues we'd like to avoid - while easy to read for consumers, the vanilla JS ways of producing fluent interfaces are not obvious at first glance.

##Implementing a library for fluency
How might a library for creating fluent interfaces look like? While there are a couple of possible approaches, the main idea behind them would be to offer some sort of builder which would produce a segmented fluent function. Let us first consider how this might be achieved in the future.

This is **Ideal interface for fluent function creation**.

Arguably, the ideal interface for creating fluent interfaces would itself be fluent. It should also self-document how to use the created function. In other words, it would look something like this:

```javascript
let insert = fluentInterface()
  .insert('value').into('array').after('otherValue')
  ._implementedBy(function ({value, array, otherValue}) {
    array.splice(array.indexOf(otherValue) + 1, 0, value);
    return array;
  });
```

Here, we'd be using named arguments (which might have some sort of validation attached to them, if so desired) and [ES6 Object Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring) to get those into our implementation function. The second line is both a spec for the builder and documentation for the users of this fluent function.

##Using ES6 Proxy
The [Proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object in ES6 is very promising in this regard. It is, however, not ready for any kind of real usage just yet. There is a shim called [harmony-reflect](https://github.com/tvcutsem/harmony-reflect), but even that at the time of writing this post is mostly supported via browser flags.

In short, the Proxy object allows us to define what happens when a property is accessed, and intercept that with some custom behavior. In our case, we can simply store the property that was called as the new segment name. Here's how that might look:

```javascript
function fluentInterface() {
  let parameterSpec = {},
    builder = new Proxy({}, {
      get: function (target, segmentFunction) {
        return segmentFunction === '_implementedBy' ? _implementedBy : function () {
          parameterSpec[segmentFunction] = Array.from(arguments);
          return builder;
        };
      }
    });
  /*... implementation ...*/
  return builder;
}
fluentInterface().insert // returns function that adds its arguments to the parameterSpec
fluentInterface().insert('value') // returns builder
// parameterSpec === {insert: ['value']}
```

While the full implementation of the ideal interface in ES6 is beyond the scope of this post, my attempts can be explored in the initial commits of [this repository](https://github.com/nikaspran/fluent.js/tree/a00b9d6ba7c388fa09fa5e69cf21e562e7c8699b), specifically the files [fluent-obj.js](https://github.com/nikaspran/fluent.js/blob/a00b9d6ba7c388fa09fa5e69cf21e562e7c8699b/fluent-obj.js) and [fluent-arr.js.](https://github.com/nikaspran/fluent.js/blob/a00b9d6ba7c388fa09fa5e69cf21e562e7c8699b/fluent-arr.js)

##Lest we forget the present..
[It seems](https://github.com/tvcutsem/harmony-reflect/issues/8) there is no simple way to implement the ideal builder interface under ES5. There is always the possibility of transpiling (a la [JSX](http://blog.wix.engineering/2015/04/30/fluent-javascript/)), but that would most likely not be worth the trouble, unless creating an extraordinary amount of fluent functions.

All is not lost, however, as with some lenience in the permitted builder interface we can still arrive at something both readable and very backwards compatible.

##Introducing fluent.js
And so a few days ago I came up with a tiny JavaScript library called [fluent.js](https://github.com/nikaspran/fluent.js). It's meant to be a simple solution for building fluent interfaces en masse. Here's the interface of the builder:

```javascript
var fluent = require('fluent.js');
var insert = fluent({
  insert: '*',
  into: '[]',
  after: '*'
}, function implementedBy(value, array, otherValue) {
  array.splice(array.indexOf(otherValue) + 1, 0, value);
  return array;
});
insert(2).into([1, 3]).after(1); //[1, 2, 3]
```

Not perfect, but it resembles the ideal interface enough that I consider it usable. It is currently able to extend existing objects too, which would look something like this:

```javascript
fluent({
  with: '*',
  after: '*'
}, function handler(value, otherValue) {
  var copy = this.slice(0);
  copy.splice(copy.indexOf(otherValue) + 1, 0, value);
  return copy;
}, Array.prototype);
['this', 'awesome'].with('is').after('this'); //['this', 'is', 'awesome']
```

There's **more** to be done:

* Argument validation - from required and optional arguments, to some sort of rudimentary type validation, a lot can be done here to facilitate solid API design with little effort.
* Browser build - the library is currently Node.js only, but it would be trivial to create a build for the browser. Since the implementation is relatively straightforward, it should support pretty much anything, even the last few remaining IE6s running on potatoes.
* Branching segments - this might require altering the interface a little bit, but a nice feature would be to support alternate branches for fluent functions, with different implementations backing them. For example:

```javascript
insert(2).into([1, 3]).after(1); //[1, 2, 3]
// OR
insert(2).into([1, 3]).before(3); //[1, 2, 3]
```

##In place of a summary
Writing clean and readable code doesn't have to be difficult. While fluent interfaces might take a little bit of work to get right, they are an important tool in improving readability. Most importantly, clean code is supposed to be fun to both write and read. What would an entirely fluent program look like? Could it be read like prose, essentially a high level description of the problem being solved?
Experiment, and prosper.

Original post &raquo; [Fluent JavaScript](http://nikas.praninskas.com/javascript/2015/04/26/fluent-javascript/)
