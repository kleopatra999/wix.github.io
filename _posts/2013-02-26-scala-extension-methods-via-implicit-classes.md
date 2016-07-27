---
layout: post
title: Scala Extension methods via implicit classes
date: 2013-02-26 10:56:08.000000000 +02:00
type: post
published: true
status: publish
categories:
- Scala
tags:
- '2.10'
- Extension
- Extension methods
- implicit
- implicit class
- scala
meta:
  _edit_last: '12'
  _syntaxhighlighter_encoded: '1'
  _wpas_done_all: '1'
author:
  login: kfirb@wix.com
  email: kfirb@wix.com
  display_name: Kfir Bloch
  first_name: ''
  last_name: ''
---
In this post i will demonstrate a nice trick to add "extension methods" for a given class.
Note: The feature is based on implicit class feature and available only in Scala 2.10

```scala
case class Cat(name : String, kittens : Seq[Cat] = Nil)
object implicits{
implicit class SmellyCat(cat : Cat) {
 def hasKittens : Boolean = cat.kittens.size &gt; 0
 }
```

A class Cat has a name and a list of kittens. in this example we add a method named *hasKittens()* to the Cat class. This is done by creating the implicit class SmellyCat which implicitly wraps our Cat instance when calling *hasKittens()*.

The following test shows the usage of this feature:

```scala
class ExtensionFunction extends WordSpec with ShouldMatchers with MustMatchers{
&quot;extension function &quot; should {
 &quot;extend function of cat &quot; in {
import implicits._
 val cat1 = Cat(&quot;Philip&quot;)
 cat1.hasKittens should equal(false)
val cat2 = Cat(&quot;Kozmo&quot;, Seq(Cat(&quot;Mitzi&quot;)))
 cat2.hasKittens should equal(true)
   }
  }
}
```

To use the extended function you need to import the class (*import implicits._*).
Note: implicit class cannot be on the top level of the project and must be wrapped inside an object 
