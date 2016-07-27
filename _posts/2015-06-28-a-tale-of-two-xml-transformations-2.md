---
layout: post
title: A Tale of Two XML Transformations
date: 2015-06-28 13:48:49.000000000 +03:00
type: post
published: true
status: publish
categories:
- Scala
tags: []
meta:
  _edit_last: '35'
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: XML
  _yoast_wpseo_linkdex: '91'
  _yoast_wpseo_metadesc: How we tackled the problem of transforming XMLs by implementing
    our own XML transformation function in Scala to improve performance
author:
  login: michaelda
  email: michaelda@wix.com
  display_name: Michael Dagaev
  first_name: Michael
  last_name: Dagaev
---
A few months ago we noticed unusually high CPU usage in one of our services. At first we didn’t take it seriously, but when we got a critical alert about 100% CPU utilization, we began to act.

We ran top -H <*service pid*> in the troubled host and spotted a few threads that were using a CPU core each. Then we ran jstack <service pid> to get the thread stacks dump. The dump showed that all the threads in question were executing method transform of [scala.xml.transform.RuleTransformer](https://github.com/scala/scala-xml/blob/master/src/main/scala/scala/xml/transform/RuleTransformer.scala) class, which performs XML transformations. So RuleTransformer became our main suspect.

##XML Transformation Overview
The service used [RuleTransformer](https://github.com/scala/scala-xml/blob/master/src/main/scala/scala/xml/transform/RuleTransformer.scala) and [RewriteRule](https://github.com/scala/scala-xml/blob/master/src/main/scala/scala/xml/transform/RewriteRule.scala) classes of the scala-xml library to transform data from one XML format to another.
For example:
for each element in XML
    change label “a” to “b”
    replace attribute “x” with “z”
    etc.

*RewriteRule* is an abstract base class of any transformation rule. We extend it and override its method transform to implement a transformation we need. The example below creates a new RewriteRule to change the labels of all elements to “b”:

```scala
import scala.xml._, scala.xml.transform._
val changeLabel = new RewriteRule() {
   override def transform(node: Node) = node match {
     case e: Elem => e.copy(label = "b")
     case other => other
   }
}
```

The RuleTransformer class applies a number of *RewriteRule* instances to an input XML. *RuleTransformer* defines a constructor, which takes a number of *RewriteRule* instances as its arguments, and applies those rules to the input using the *apply* method.

```scala
val changeLabelTransformer = new RuleTransformer(changeLabel)
val a: Node = <a1><a2/></a1>
val b: Node = changeLabelTransformer(a)
```

##Casual Testing
First, we tested the performance of our *changeLabelTransformer* in a REPL with an XML of a few dozen nesting levels. It turned out that it took **a few minutes** on a modern laptop to handle just **20-25** levels.

Then we counted how many times the *RuleTransformer* transform method visited each node of the input XML. We added a buffer visited, and extended the RuleTransformer to store each *visited* node in the buffer:

```scala
import scala.collection.mutable.ListBuffer
val visited = ListBuffer[Node]()
val changeLabelTransformer = new RuleTransformer(rule) {
  override def transform(n: Node): Seq[Node] = {
    visited.append(n)
    super.transform(n)
  }
}
```

The experiment showed that every node in **N**th level (zero based) was visited **2^N** times.

For example, we applied changeLabelTransformer to an XML of 3 nesting levels, *<a0><a1><a21/><a22/><a23/></a1></a0>*, and printed out *visited* as follows:

```scala
visited.groupBy(identity).mapValues(_.size).toSeq.sortBy(_._2)
```

The output showed that node a0 was visited **once**, node a1 was visited **twice**, and nodes a21, a22, a23 were visited **four** times each.

##Complexity Analysis
The exponential complexity of the transform method became obvious from the analysis of the [scala.xml.transform.BasicTransformer](https://github.com/scala/scala-xml/blob/master/src/main/scala/scala/xml/transform/BasicTransformer.scala) source code:

```scala
def transform(ns: Seq[Node]): Seq[Node] = {
   val (xs1, xs2) = ns span (n => unchanged(n, transform(n)))
   if (xs2.isEmpty) ns
     else xs1 ++ transform(xs2.head) ++ transform(xs2.tail)
}
def transform(n: Node): Seq[Node] = {...}
```

Method *transform(n: Node)* invokes *transform(ns: Seq[Node])* for all children of n. In turn, *transform(ns: Seq[Node])* invokes *transform(n: Node)* for each node of ns **twice**: in line 2 and line 4. In other words, the total work of handling one node in Nth level (zero-based) is T(N)=2*T(N-1)=2*2*T(N-2)=...=2^N*T(0)=O(2^N) .

The total work of handling all nodes is O(2^0) + O(2^1) +... O(2^H-1))=O(2^H), where H is the height of the XML tree.

##Solution
Once it was clear that RuleTransformer was not feasible, we coded an XML transforming function by ourselves.

```scala
def trans(node: Node, pf: PartialFunction[Node, Node]): Node =
  pf.applyOrElse(node, identity[Node]) match {
    case e: Elem => e.copy(child = e.child map (c => trans(c, pf)))
    case other => other
  }
```

The example below shows a new function, changeLabel, which replaces all labels to “b”:

```scala
def changeLabel(node: Node): Node =
  trans(node, {case e: Elem => e.copy(label = "b")})
```

The complexity of trans is O(N), where N is a number of nodes and it takes ∫ to handle XMLs of 20-25 nesting levels.

##Conclusion
The *RuleTransformer* complexity is exponential. It was the cause of the high CPU load and production issues. As you just read, we replaced *RuleTransformer* with another implementation, which solved the issues. Moreover, we even managed to reduce the number of servers hosting our service.
