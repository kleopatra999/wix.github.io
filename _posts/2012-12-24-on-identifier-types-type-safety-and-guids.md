---
layout: post
title: On Identifier types, type-safety and Guids
date: 2012-12-24 09:09:24.000000000 +02:00
type: post
published: true
status: publish
categories:
- Scala
tags:
- programming
- type-safety
meta:
  _edit_last: '5'
  _syntaxhighlighter_encoded: '1'
  _wpas_done_all: '1'
author:
  login: shaiy@wix.com
  email: shaiy@wix.com
  display_name: Shai Yallin
  first_name: Shai
  last_name: Yallin
---
How many times did you find yourself looking at an API which accepts some sort of string or int-based identifier and not being sure what the identifier should represent? This sort of thing happens a lot when you use several different DAO or Repository objects. For instance, I may have:

```scala
case class Cat(id: String)
case class Dog(id: String)
trait CatRepository {
  def get(id: String): Cat
}
trait DogRepository {
  def get(id: String): Dog
}
```

Note how easy it would be to accidentally pass a dog id into the get method of CatRepository.

Now, back in the happy days of Ada and Delphi (and Pascal, of course), you could define your own types; for instance, I could write:

```delphi
type CatId is String
type DogId is String
```

for which the compiler will produce an error if I try to pass a DogId instead of a CatId. Another highlight of using specific types for identifiers is that we now provide a higher-level abstraction over the concrete type of the identifier. I no longer care that a DogId happens to be a string - I just treat it as a DogId everywhere in the system.

Scala also has the type keyword, allowing us to define custom types. However, this only defines a type-alias, not a truly separate type in the type system. As a result, I could pass a string instead of DogId or even worse, a CatId instead of DogId:

```scala
type CatId = String
type DogId = String
case class Cat(id: CatId)
case class Dog(id: DogId)
trait CatRepository {
  def get(id: CatId): Cat
}
trait DogRepository {
  def get(id: DogId): Dog
}
...
val id: DogId = &quot;fido&quot;
val cat = catRepo.get(id) // this compiles because DogId is really a String
```

So, we need to take a more drastic measure to cause compilation to break if I try to pass a DogId instead of a CatId.
A few years ago, [Eishay Smith](http://www.eishay.com/) mentioned during a conversation that he likes to use Java Generics to enforce identifier type safety. He suggested what in Scala would look like:

```scala
case class Id[T](id: String)
```

Using the *Id[T] type*, I can now use the T type argument to break compilation when passing wrong identifier values:

```scala
type CatId = Id[Cat]
type DogId = Id[Dog]
...
val id: DogId = _
val cat = catRepo.get(id) // this now breaks compilation; expected: CatId, actual: DogId
```

This is all well and nice, but I still need to be able to create DogId or CatId instances from strings somewhere in the system (for instance, when mapping from a database query). Using the current code, I'll have to break the abstraction when creating the Id instance, assigning a value of Id[T] to my DogId value:

```scala
val id = Id[Dog](resultSet.get(&quot;id&quot;))
```

How can we avoid this? I decided to use a helper trait and create a "companion" object for each type:

```scala
case class Id[T](id: String)
trait IdGen[T] {
  def apply[T](id: String) = Id[T](id)
}
...
type CatId = Id[Cat]
type DogId = Id[Dog]
object CatId extends IdGen[Cat]
object DogId extends IdGen[Dog]
...
val id = DogId(resultSet.get(&quot;id&quot;))
```

which now allows me to abstract away the creation of Id instances, resulting in a system-wide agnosticism to the fact that my *DogId* type is actually an *Id[Dog]*.
A final issue that bugs me is that nowhere in the Java ecosystem is to be found a better Guid implementation than *java.util.UUID*, which contains some terrible code smells hidden inside it. At Wix, we've been using a *Guid[T]* class for some time now, which looks something like this:

```scala
case class Guid[T](id: String) extends Id[String] {
  override def toString = id.toString
}
object Guid {
  def apply[T](id: UUID) = new Guid[T](id.toString)
  def random[T] = Guid[T](UUID.randomUUID())
}
trait GuidGen[T] {
  def random = Guid.random[T]
  def apply(id: String) = Guid[T](id)
}
```

which now allows me to create Guids without holding reference to instances of Java's UUID class:

```scala
type CatId = Guid[Cat]
type DogId = Guid[Dog]
object CatId extends GuidGen[Cat]
object DogId extends GuidGen[Dog]
val dogId = DogId.random
val dog = dogRepo.get(dogId)
```
