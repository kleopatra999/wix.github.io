---
layout: post
title: Why calling Source.mkString() is a very bad idea
date: 2013-04-11 12:05:42.000000000 +03:00
type: post
published: true
status: publish
categories:
- Scala
tags:
- io
- scala
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
So we have some Scala code that consumes text from an InputStream from an HTTP response.  So, like any good Scala developer, I handed over the response to a function that returns a String. This function performs some validations such as checking that the response status is 200, then consumes the InputStream. This was done by creating a *scala.io.Source* from the InputStream, then calling *source.mkString* to consume the response body.

Or so I thought.

Apparently, *scala.io.Source* is an Iterator[Char] and inherits the mkString() function from TraversableOnce. Calling a *TraversableOnce.mkString()* appends all members of the TraversableOnce instance to a StringBuilder - which is fine, unless this instance is actually an abstraction over an IO-bound stream, whereupon it consumes the stream **byte-by-byte**.

This is, as some of you might now, a terribly inefficient way to consume an InputStream, especially a network-bound one. When running a thread profiler, we were horrified to discover that we are spending almost 70% of the time waiting on IO consuming these HTTP responses.

The solution?

```scala
Source.fromInputStream(response.getInputStream, "UTF-8").getLines.mkString
```

Test code I used to prove the problem:

```scala
package com.wixpress.scala
import java.io.ByteArrayInputStream
import scala.io.Source
object SourceBenchmark {
  def main(args: Array[String]) {
    val bytes = new Array[Byte](1024 * 1024)
    val is = new ByteArrayInputStream(bytes)
    val mkStringTime = measureInNanos {
      Source.fromInputStream(is).mkString
    }
    val getLinesTime = measureInNanos {
      Source.fromInputStream(is).getLines().mkString
    }
    println("Time with mkString: %s, time with getLines: %s".format(mkStringTime, getLinesTime))
  }
  def measureInNanos(f: =&gt; Unit) = {
    val before = System.nanoTime()
    f
    System.nanoTime() - before
  }
}
```

This output (from my late 2011 MacBook Pro):
Time with mkString: 548707000, time with getLines: 1868000
This is a difference of about x600 in favor of the version with getLines()!

**Edit**: I have [created an issue](https://issues.scala-lang.org/browse/SI-7356) in the Scala issue tracker for this bug.
