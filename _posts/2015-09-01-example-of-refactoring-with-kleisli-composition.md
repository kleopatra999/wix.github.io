---
layout: post
title: Refactoring with Kleisli Composition
date: 2015-09-01 13:33:52.000000000 +03:00
type: post
published: true
status: publish
categories:
- Scala
tags: []
meta:
  _edit_last: '43'
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: Kleisli
  _yoast_wpseo_linkdex: '86'
  _yoast_wpseo_metadesc: How to use Kleisli composition and the Scalaz library to
    refactor Scala legacy code and implement new requirements
author:
  login: michaelda
  email: michaelda@wix.com
  display_name: Michael Dagaev
  first_name: Michael
  last_name: Dagaev
---
For quite awhile we have been maintaining an application that processes XML and JSON data. Usually the maintenance consists of fixing defects and adding minor features, but sometimes it requires refactoring old code.

Consider, for example, a function that extracts an XML node by path:

```scala
import scala.xml.{Node => XmlNode}
def getByPath(path: List[String], root: XmlNode): Option[XmlNode] =
  path match {
    case name::names =>
      for {
        node1 <- root.child.find(_.label == name)
        node2 <- getByPath(names, node1)
      } yield node2
    case _ => Some(root)
  }
```

This function works fine, but requirements change and now we need to:

* Extract nodes from JSON and other tree-like data structures, not only XML
* Return a descriptive error message if the node is not found

This post explains how to refactor *getByPath* to meet the new requirements.

##Refactoring with Kleisli Composition
Let’s factor out a piece of code that creates a function to extract a child node by name. We could name it *createFunctionToExtractChildNodeByName*, but let’s name it child for brevity.

```scala
val child: String => XmlNode => Option[XmlNode] =
  name => node => node.child.find(_.label == name)
```

Now we can make the key observation: our getByPath is a sequential composition of functions that extract child nodes.The code below shows an implementation of this composition:

```scala
def compose(getChildA: XmlNode => Option[XmlNode],
            getChildB: XmlNode => Option[XmlNode]): XmlNode => Option[XmlNode] =
  node => for {
            a  <- getChildA(node)
            ab <- getChildB(a)
          } yield ab
```

Fortunately, the [Scalaz](https://github.com/scalaz/scalaz) library provides a more generic way to compose function *A => M[A]*, where *M* is a monad. The library defines *Kleisli[M, A, B]*: a wrapper for *A => M[B]*, which has method >=> to chain the Kleisli wrappers in the same way as andThen chains regular functions. We will call this chain Kleisli composition. The code below provides a composition example:

```scala
val getChildA: XmlNode => Option[XmlNode] = child(“a”)
val getChildB: XmlNode => Option[XmlNode] = child(“b”)
import scalaz._, Scalaz._
val getChildAB: Kleisli[Option, XmlNode, XmlNode] =
  Kleisli(getChildA) >=> Kleisli(getChildB)
```

Note the [point-free](https://wiki.haskell.org/Pointfree) style we are using here. It is very common for functional programmers to write functions as a composition of other functions, never mentioning the actual arguments they will be applied to.

The *Kleisli composition* is exactly what we need to implement our getByPath as the composition of functions extracting child nodes.

```scala
import scalaz._, Scalaz._
def getByPath(path: List[String], root: XmlNode): Option[XmlNode] =
  path.map(name => Kleisli(child(name)))
    .fold(Kleisli.ask[Option, XmlNode]) {_ >=> _}
    .run(root)
```

Note the using of *Kleisli.ask[Option, XmlNode]* as the neutral element of the fold. We need this neutral element to handle a special case when path is *Nil. Kleisli.ask[Option, XmlNode]* it's just an alias of a function from any node to *Some(node)*.

##Abstracting over XmlNode
Let’s generalize our solution and abstract it over *XmlNode*. We can rewrite it as the following generic function:

```scala
def getByPathGeneric[A](child: String => A => Option[A])
                       (path: List[String], root: A): Option[A] =
  path.map(name => Kleisli(child(name)))
    .fold(Kleisli.ask[Option, A]) {_ >=> _}
    .run(root)
```

Now we can reuse this generic function to extract a node from JSON (we use [json4s](https://github.com/json4s/json4s) here):

```scala
import org.json4s._
def getByPath(path: List[String], root: JValue): Option[JValue] = {
  val child: String => JValue => Option[JValue] = name => json =>
    json match {
      case JObject(obj) => obj collectFirst {case (k, v) if k == name => v}
      case _ => None
    }
  getByPathGeneric(child)(path, root)
}
```

Note that we wrote a new function, child: *JValue => Option[JValue]*, to handle JSON instead of XML, but *getByPathGeneric* remains unmodified and handles both XML and JSON.

##Abstracting over Option
We can generalize *getByPathGeneric* even further and abstract it over Option with Scalaz, which provides an instance of *scalaz.Monad[Option]*. So we can rewrite getByPathGeneric as follows:

```scala
import scalaz._, Scalaz._
def getByPathGeneric[M[_]: Monad, A](child: String => A => M[A])
                                    (path: List[String], root: A): M[A]=
  path.map(name => Kleisli(child(name)))
    .fold(Kleisli.ask[M, A]) {_ >=> _}
    .run(root)
```

Now we can implement our original *getByPath* with *getByPathGeneric*:

```scaladef getByPath(path: List[String], root: XmlNode): Option[XmlNode] = {
  val child: String => XmlNode => Option[XmlNode] = name => node =>
    node.child.find(_.label == name)
  getByPathGeneric(child)(path, root)
}
```

Next we can reuse getByPathGeneric to return an error message if the node is not found.

To do this, we will use [scalaz.\/](https://github.com/scalaz/scalaz/blob/scalaz-seven/core/src/main/scala/scalaz/Either.scala) (aka *disjunction*), which is a monadic right-biased version of *scala.Either*. On top of that, Scalaz provides implicit class *OptionOps* with method *toRightDisjunction[B](b: B)*, which converts *Option[A]* to *scalaz.B\/A* so that *Some(a)* becomes *Right(a)* and None becomes *Left(b)*. You can find more info about \/ in other blogs.

Thus we can write a function, which reuses *getByPathGeneric*, to return an error message instead of None if the node is not found:

```scala
type Result[A] = String\/A
def getResultByPath(path: List[String], root: XmlNode): Result[XmlNode] = {
  val child: String => XmlNode => Result[XmlNode] = name => node =>
    node.child.find(_.label == name).toRightDisjunction(s"$name not found")
  getByPathGeneric(child)(path, root)
}
```

##Conclusion
The original *getByPath* function handled only XML data and returned None if the node was not found. We also needed it to handle JSON and return a descriptive message instead of None.
We have seen how using *Kleisli* composition provided by Scalaz can factor out the generic function *getByPathGeneric*, which we abstracted further using generics (in order to support JSON) and disjunction (to generalize over *Option*).
