---
layout: post
title: Using Specs² macro matchers for fun and profit
date: 2013-12-27 00:44:05.000000000 +02:00
type: post
published: true
status: publish
categories:
- Scala
tags: []
meta:
  _edit_last: '5'
  foobar_type: default
  foobar_select: '0'
  _syntaxhighlighter_encoded: '1'
  _sd_is_markdown: ''
  _wpas_done_all: '1'
author:
  login: shaiy@wix.com
  email: shaiy@wix.com
  display_name: Shai Yallin
  first_name: Shai
  last_name: Yallin
---
At Wix, we make extensive use of the [Specs²](http://etorreborre.github.io/specs2/) testing framework. It has become the standard tool for writing software specifications in our backend group, replacing JUnit, Hamcrest and ScalaTest.

We have always been highly fond of matchers, having adopted Hamcrest back in 2010, and our testing methodology has developed to heavily rely on matchers. We went as far as writing a small utility framework, back in our Java days, that takes an Interface and creates a matcher from it using JDK Proxy. For a class Cat with fields age and name, the interface would basically look like this:

```java
interface CatMatcherBuilder extends MatcherBuilder<Cat> {
  public CatMatcherBuilder withAge(int age);
  public CatMatcherBuilder withName(String name);
}
```

Which then would've been used like this:

```java
CatMatcherBuilder aCat() {
  return MatcherBuilderFactory.newMatcher(CatMatcherBuilder.class);
}
...
assertThat(cat, is(aCat().withName("Felix").withAge(1)));
```

As you can see, this involves a fairly large amount of boilerplate.
Moving to Specs², we wanted to keep the ability to write matchers for our domain objects. Sadly, this didn't look much better written using Specs² matchers:

```scala
def matchACat(name: Matcher[String] = AlwaysMatcher(),
              age: Matcher[Int] = AlwaysMatcher()): Matcher[Cat] =
  name ^^ {(cat: Cat) => cat.name} and
  age ^^ {(cat: Cat) => cat.age}
```

What quickly became apparent is that this calls for a DRY approach. I looked for a way to create matchers like these automatically, but there was no immediate solution for implementing this without the use of compiler-level trickery.

The breakthrough came when we hosted [Eugene Burmako](https://twitter.com/xeno_by) during Scalapeño 2013.
I discussed the issue with Eugene who assured me that it should be fairly easy to implement this using macros. Next, I [asked Eric](https://twitter.com/etorreborre), the author and maintainer of Specs², if it would be possible for him to do that. Gladly, Eric took the challenge and Eugene joined in and helped a lot, and finally, starting with version 2.3 of Specs², we can use macros to automatically generate matchers for any complex type. Usage is fairly simple; you need to add the Macro Paradise compiler plugin, then simply extend the MatcherMacros trait:

```scala
class CatTest extends Specification with MatcherMacros {
  "a cat" should {
   "have the correct name" in {
     val felix = Cat(name = "Felix", age = 2)
     felix must matchA[Cat].name("Felix")
   }
  }
}
```

It's also possible to pass a nested matcher to any of the generated matcher methods, like so:

```scala
class CatTest extends Specification with MatcherMacros {
  "a cat" should {
   "have the correct name" in {
     val felix = Cat(name = "Felix", age = 2)
     felix must matchA[Cat].name(startWith("Fel"))
   }
  }
}
```

For further usage examples you can look at the appropriate [Unit test](https://github.com/etorreborre/specs2/blob/master/tests/src/test/scala/org/specs2/matcher/MatcherMacrosSpec.scala) or check out my usage in the newly released [Future Perfect](https://github.com/wix/future-perfect) library.
This would be the place to thank Eric for his hard work and awesomeness responding to my crazy requests so quickly. Eric, you rock. 
