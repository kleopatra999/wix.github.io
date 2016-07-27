---
layout: post
title: 'JavaScript: The Extra Good Parts'
date: 2015-04-21 17:02:05.000000000 +03:00
type: post
published: true
status: publish
categories:
- JavaScript
tags:
- client
- FED
- Javascript
meta:
  _edit_last: '43'
  _oembed_1be968fecbdc54be6cad02794dbacd74: "{{unknown}}"
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: javascript
  _yoast_wpseo_metadesc: A list of Javascript features that front-end developers should
    embrace.
  _yoast_wpseo_linkdex: '87'
author:
  login: dansh
  email: dansh@wix.com
  display_name: Dan Shappir
  first_name: Dan
  last_name: Shappir
---
Douglas Crockford has had a huge influence over a generation of JavaScript developers with his book [JavaScript: The Good Parts](http://shop.oreilly.com/product/9780596517748.do). Thanks to his book, which teaches the good parts of the language, we also learned that JavaScript contains more than a fair share of bad parts that developers should avoid.

Even developers who haven’t read this book have still been influenced by it thanks to tools such as [JSLint](http://www.jslint.com/), [JSHint](http://jshint.com/), and [ESLint](http://eslint.org/). These tools are often used to enforce Crockford’s guidelines throughout the development process. As a result, bad parts such as the with statement and switch fall-throughs are all but extinct.

As JavaScript evolves and matures, the good parts in JavaScript are expanding. Yet, I’ve noticed that many JavaScript developers avoid these enhancements to the language, either because they’re unaware of them or due to excessive compatibility concerns. Or perhaps many developers simply embrace the “if it ain't broke, don't fix it” attitude, and continue to use only the good parts they’re familiar with, even though the language now contains what I consider to be “extra” good parts.

Here is a list of some additional good parts that I recommend developers embrace. These are all features and capabilities that are available in the language today, not experimental parts of some future version.

##Getters and Setters
Getters and setters are a very well-known technique in Object-Oriented Programming for enabling encapsulation and avoiding tight-coupling between components ([Mutator Methods](https://en.wikipedia.org/wiki/Mutator_method)). I often see getters and setters being implemented in JavaScript as explicit methods, for example:

```javascript
function wrapValue(value) {
   return {
      getValue: function () { return value; },
      setValue: function (newValue) { value = newValue; }
   };
}
var x = wrapValue(5);
console.log(x.getValue()); // output 5
x.setValue(7);
console.log(x.getValue()); // output 7
```

This approach certainly works, but I find it to be overly verbose. A better approach is to use properties, which enables access to such values using the same syntax, and with the same convenience as regular fields, without sacrificing encapsulation. Moreover, properties are very familiar to JavaScript developers because they are utilized by strings, arrays, and the browser DOM. Here is the same example written using JavaScript getters and setters:

```javascript
function wrapValue(_value) {
   return {
      get value() { return _value; },
      set value(newValue) { _value = newValue; }
   };
}
var x = wrapValue(5);
console.log(x.value); // output 5
x.value = 7;
console.log(x.value); // output 7
```

Getters and setters have been available in Chrome since day one, in Firefox since version 2, version 3 of Safari, Internet Explorer 9 and up, and in all mobile browsers.
##Object.create()
JavaScript provides multiple methods for creating new object instances. To this day, the new operator appears to remain the most popular method, even though it’s arguably the most problematic and least flexible approach. The Object.create method provides an improved alternative to the new operator, with the following benefits:

* You can explicitly specify, at object creation time, the object that will be the prototype of the newly created object.
* You can create objects that have no prototype by specifying null as the prototype. This is something that can’t otherwise be done. This can be useful when using an object as a dictionary, for example.
* You can easily specify the properties of the newly created object, including their descriptors: configurable, enumerable, and writable. 

```javascript
var x = Object.create(null, {prop: {value: 3, writable: false}});
console.log(x.prop); // output 3
x.prop = 5;
console.log(x.prop); // still output 3
```

Object.create() has been available in all browsers since IE9. 

##Object.keys()
Iterating over object properties is such a common occurrence in JavaScript that there is a dedicated statement for it: for...in. Yet, as is shown in Crockford’s book, for...in is a problematic construct that usually requires a hasOwnProperty conditional to weed out undesired properties. A better, cleaner solution is to use Object.keys to generate an array of a given object's **own** enumerable properties, and then iterate over that array. For example:

```javascript
var x = {hello: 1, there: 2, world: 3};
Object.keys(x).forEach(function (key) {
   console.log(key, x[key]);
});
// Output three lines: hello 1, there 2, world 3
```

This approach also allows you to sort or otherwise modify the array of property names before iterating over it. Object.keys has been available in browsers since IE9. 

##Array.prototype.map() and Array.prototype.reduce()
Iterating over arrays using forEach is a nicer, more modern, and seemingly more functional approach than an old-fashioned for loop. I say “seemingly” because any operation performed inside forEach can only return results via side-effects, or by modifying the original array. However, a more functional approach is to use other iteration methods available for arrays, such as map and reduce. These methods don’t require side-effects, and can treat the original array as immutable. For example, summing an array using forEach requires an external variable to modify:

```javascript
var sum = 0;
ar.forEach(function (v) { sum += v; });
console.log('sum:', sum);
```
whereas reduce doesn’t require such a variable:
```javascript
console.log('sum:', ar.reduce(function (sum, v) {
   return sum + v; }, 0));
```

Both reduce and map have the same browser support as forEach.

##Array.prototype.every() and Array.prototype.some()
Another limitation with forEach is that you can’t break out of the loop (and no, using exceptions doesn’t count). As a result, I’ve seen developers either revert back to for loops when needing to be able to break out, or needlessly iterate over extraneous array elements. A better solution exists in the form of the lesser known every and some array iteration methods. every iterates until the provided callback returns false, and some iterates until the provided callback returns true.

```javascript
ar.some(function (v) {
   if (isDone(v)) {
       return true;
   }
   doSomething(v);
});
```

Both every and some have the same browser support as forEach.

##Object.freeze(), Object.seal(), and Object.preventExtensions()
One of JavaScript’s greatest strengths is its malleability; for example, you can add new properties to existing objects at any time. Sometimes, however, that’s not a good thing. For example, you may want to make certain objects immutable, and prevent undesirable and unexpected modifications of those objects.

In such cases, Object.freeze, Object.seal, and Object.preventExtensions can be very useful. Object.freeze makes an object effectively immutable—any attempt to modify the object in any way will fail, either silently or by throwing a TypeError exception (most commonly in strict mode). Object.seal prevents the structure of an object from being changed, but values of existing properties can still be modified. Object.preventExtensions just prevents new properties from being added to the object.

Freezing or sealing objects can be a very effective mechanism for ensuring proper ownership and utilization of objects. Used in conjunction with strict mode, they allow you to specify that an object is immutable, and any attempt to modify it will fail and be intercepted and reported as an error.

##Summary
As JavaScript continues to evolve and grow under community scrutiny, the portion of the good parts in the language increases. Learning and understanding JavaScript’s new and improved features and capabilities can increase development productivity and the quality of the resulting code. Certainly, if Douglas Crockford ever updates his book, the result would be much thicker than the first edition (see its current size compared to [JavaScript: The Definitive Guide](http://shop.oreilly.com/product/9780596805531.do)).

