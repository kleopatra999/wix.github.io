---
layout: post
title: Scala at Wix
---

# Scala at Wix

### Best practices, do's and don'ts and links to useful guides

## Learning Scala

Probably the best introductory text to Scala available today is Twitter's Scala School. Read it thoroughly but not in a single run. Return to it from time to time to refreshen your knowledge and for concrete reference in case of need.

Twitter's Effective Scala document provides best practice guidelines that we agree with in most cases. Read below for specific cases where we may disagree with it or we have something to add. This is a mandatory read before you start coding in Scala.

## Do's and Don'ts

### XML

Don't use the scala.xml package; first of all, do you really neex XML support? if all you need is serialization, consider using JSON. If you really need XML, use JAXB.

### JSON

Use Jackson with the Scala Module. It should allow you to fully serialize and deserialize Case Classes, Monads, Scala collections, etc.

### Collections

* Always prefer immutable collections; if you think you need a mutable collection, ask yourself why, then consult a colleague
* For ordered sequences (where you would've used java.util.List, use Seq)
* For ConcurrentMaps, see the appropriate page at Twitter's Concurrency lesson and the Scala API Docs
* Read the Collections section of Effective Scala for more info

### Object Oriented Programming

Adhere to the regular principles; separation of concerns and the single responsibility principle are easy to achieve using traits and mixins. Use case classes for value types (operation input / output values), even if the input is a single argument. This makes your code more structured and resilient to future changes.

### Enums

Don't extend Scala's Enumeration type. Instead, created a sealed trait as your enum type and extend it with case objects:

```
sealed trait Animal
case object Cat extends Animal
case object Dog extends Animal
case object Goat extends Animal

def makeSound(animal: Animal) = animal match {
  case Cat => "meow"
  case Dog => "woof"
  case Goat => "baaah"
}
```

Making the trait sealed will cause compilation to break if you neglect to match on an Animal type, or if you add a type in the future.

### Dependency Injection

Use plain constructor injection; avoid cake pattern as it makes unit testing difficult. Prefer composition over inheritance. Use cake pattern in wiring code (Spring configuration classes); each configuration class should declare its dependencies as abstract methods.

### Learning

The Scala REPL is a powerful tool. Learn how to use it.
