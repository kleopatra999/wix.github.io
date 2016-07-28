---
layout: post
title: Explicit Implicit Conversion
date: 2014-07-05 10:26:35.000000000 +03:00
type: post
published: true
status: publish
categories:
- Scala
- Tips and Tricks
tags:
- converter
- implicit
- implicit class
- implicit conversion
- scala
meta:
  _edit_last: '1'
  _sd_is_markdown: '1'
  foobar_type: default
  foobar_select: '0'
  _syntaxhighlighter_encoded: '1'
  _wpas_done_all: '1'
  _thumbnail_id: '706'
author:
  login: noama@wix.com
  email: noama@wix.com
  display_name: Noam Almog
  first_name: Noam
  last_name: Almog
---
One of the most common pattern we use on our day to day is converting objects from one type of object to another.&nbsp;The reasons for that are varied; one reason is to distinguish between external and internal implementations, another reason would be to enrich incoming data with additional information or to filter out some aspects of the data before sending it over to the the user.

There are several approaches to achieve this conversion between object.

##The Naïve Approach
Add your converter code to the object explicitly

```scala
case class ClassA(s: String)
case class ClassB(s: String) {
   def toClassA = ClassA(s)
}
```

While this is the most straightforward and obvious implementation, it ties ClassA and ClassB together which is exactly what we want to avoid.

##The Fat Belly syndrome
When we want to convert between objects, the best way is to refactor the logic out of the class, allowing us to test it separately but still use it on several classes.
A typical implementation would look like this:

```scala
class SomeClass(c1: SomeConverter, c2: AnotherConverter, ...., cn, YetAnotherConverter) {
...........
}
```

The converter itself can be implemented as a plain class, for example:

```java
enum CustomToStringConverter {
INSTANCE;

public ClassB convert(ClassA source) {
    return new ClassB(source.str);
}

}
```

This method forces us to include all the needed converters for each class that requires these converters. Some developers might be tempted to mock those converters, which will tightly-couple their test to concrete converters. for example:

```scala
   // set mock expectations
   converter1.convert(c1) returns c2
   dao.listObj(c2) returns List(c3)
   converter2.convert(c3) returns o4
someClass.listObj(o0) mustEqual o4
```

What I don't like about these tests is that all of the code flows through the conversion logic and in the end you are comparing the result returned by some of the mocks. If for example one of the mock expectation of the converters doesn't exactly compare the input object and a programmer will not match the input object and use the any operator, rendering the test moot.

##The Lizard's Tail
Another option is to use with Scala is the ability to inherit multiple traits and supply the converter code with traits. Allowing us to mix and match these converters.
A typical implementation would look like this:

```scala
class SomeClass extends AnotherClass with SomeConverter with AnotherConverter..... with YetAnotherConverter {
  ...............
}
```

Using this approach will allow us to plug in the converters into several implementations while removing the need (or the urge) to mock conversion logic in our tests, but it raises a design question - is the ability to convert one object to another related to the purpose of the class?

It also encourages developers to pile up more and more traits into a class and never remove old unused traits from it.

##The Ostrich way
Scala allows us to hide the problem and use implicit conversions. This approach allows us to actually hide the problem. An implementation would now look like this:

```scala
implicit def converto0too2(o0: SomeObject): AnotherObj = ...
implicit def convert01to02(o1: AnotherObject): YetAnotherObj = ...
def listObj(o0: SomeObj): YetAnotherObj =&amp;nbsp;dao.doSomethingWith(entity = o0)
```

What this code actually does is converting o0 to o1 because this is what listObj needs.
When the result returns o1 and implicitly convert it to o2.
The code above is hiding a lot from us and leaves us puzzled if the tooling doesn't show us those conversions.

A good use case in which implicit conversions works is when we want to convert between object that has the same functionality and purpose. A good example for those is to convert between Scala lists and Java lists, both are basically the same and we do not want to litter our code in all of the places where we convert between those two.

To summarize the issues we encountered:

1. Long and unused list of junk traits or junk classes in the constructor
2. Traits that doesn't represent the true purpose of the class.
3. Code that hides its true flow.

To solve all of these, Scala has created a good pattern with the usage of implicit classes.
To write conversion code we can do something like this:

```scala
object ObjectsConveters {
implicit class Converto0To1(o0: SomeObject) {
   def asO1: AnotherObject = .....
}
implicit class Converto1To2(o0: AnotherObject) {
   def asO2With(id: String): YetAnotherObject = .....
}
```

Now our code will look like this:

```scala
import ObjectsConveters._
def listObj(o0: SomeObj): YetAnotherObj = listObj(o0.asO1).asO2With(id = "someId")
```

This approach allows us to be implicit and explicit at the same time. From looking at the code above you can understand that o0 is converted to o1 and the result is converted again to o2.
If the conversion is not being used, the IDE will optimize the imports out of our code. Our tests won't prompt us to mock each converter, resulting in specifications which explain the proper behavior of the code flow in our class.

Note that the converter code is tested elsewhere.
This approach allows us to write more readable test on other spots of the code. For example, in our e2e tests we reduce the number of objects we define:

```scala
"some API test" in {
   callSomeApi(someId, o0) mustEqual o0.aso2With(id = "someId")
}
```

This code is now more readable and makes more sense; we are passing some inputs and the result matches the same objects that we used in our API call.
