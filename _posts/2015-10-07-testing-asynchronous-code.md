---
layout: post
title: Testing Asynchronous Code
date: 2015-10-07 23:40:59.000000000 +03:00
type: post
published: true
status: publish
categories:
- Scala
- Tips and Tricks
tags:
- asynchronous
- CountDownLatch
- latch
- scala
- semaphore
- throttler
meta:
  _edit_last: '43'
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: asynchronous tests scala semaphore throttler CountDownLatch
    latch
  _yoast_wpseo_metadesc: Asynchronous code is hard. Writing asynchronous tests is
    even harder. Recently we fixed a flaky test and are sharing some thoughts about
    it.
  _yoast_wpseo_linkdex: '63'
author:
  login: dmitryk@wix.com
  email: dmitryk@wix.com
  display_name: Dmitry Komanov
  first_name: Dmitry
  last_name: Komanov
---
Asynchronous code is hard. Everyone knows that. Writing asynchronous tests is even harder. Recently I fixed a flaky test and I want to share some thoughts about writing asynchronous tests.

In this post we explore a common problem with asynchronous tests—how to force a test to take a specific ordering between threads, and forcing some operations by some threads to complete before other operations by other threads. Normally we do not want to enforce ordering between the execution of different threads because it defeats the reason to use threads, which is to allow concurrency and to allow the CPU to select the best order of execution given the current resources and state of the application. But in the case of testing, deterministic ordering is sometimes required to ensure the test stability.

##Testing a Throttler
A throttler is a pattern in software that is responsible for limiting the number of concurrent operations to preserve some resource quota, like a connection pool, a networking buffer, or a CPU-intensive operation. Unlike other synchronization tools, the role of a throttler is to enable “fail-fast”, allowing the over-quota requests to fail immediately without waiting.

Failing fast is important because the alternative, waiting, consumes resources—ports, threads, and memory.
Here  is a simple implementation of a throttler (basically it is a wrapper around a [Semaphore](http://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Semaphore.html); in the real world there could be waiting, retries, etc.):

```scala
class ThrottledException extends RuntimeException("Throttled!")
class Throttler(count: Int) {
  private val semaphore = new Semaphore(count)
  def apply(f: => Unit): Unit = {
    if (!semaphore.tryAcquire()) throw new ThrottledException
    try {
      f
    } finally {
      semaphore.release()
    }
  }
}
```

Let’s start with a basic unit test: testing the throttler for a single thread (we use [specs2](https://etorreborre.github.io/specs2/) for testing). In this test we are verifying that we can make more calls sequentially than the maximum number of concurrent calls for the throttler (the maxCount variable below).

Note that because we are using a single thread, we do not test the throttler “fail-fast” feature as we do not saturate the throttler. In fact, we only test that while the throttler is not saturated it does not abort operations. 

```scala
class ThrottlerTest extends Specification {
  "Throttler" should {
    "execute sequential" in new ctx {
      var invocationCount = 0
      for (i <- 0 to maxCount) {
        throttler {
          invocationCount += 1
        }
      }
      invocationCount must be_==(maxCount + 1)
    }
  }
  trait ctx {
    val maxCount = 3
    val throttler = new Throttler(maxCount)
  }
}
```

##Testing a Throttler Asynchronously
In the previous test we did not saturate the throttler simply because it is not possible with a single thread. So the next step is to test that the throttler works well in a multithreaded environment.
The setup:

```scala
val e = Executors.newCachedThreadPool()
implicit val ec: ExecutionContext=ExecutionContext.fromExecutor(e)
private val waitForeverLatch = new CountDownLatch(1)
override def after: Any = {
  waitForeverLatch.countDown()
  e.shutdownNow()
}
def waitForever(): Unit = try {
  waitForeverLatch.await()
} catch {
  case _: InterruptedException =>
  case ex: Throwable => throw ex
}
```

The *ExecutionContext* is used for Future construction; the waitForever method holds a thread until the latch is released—before the end of the test. In the after function, we shut down an executor service.
A simplistic way to test multithreaded behavior of the throttler is the following:

```scala
"throw exception once reached the limit [naive,flaky]" in new ctx {
  for (i <- 1 to maxCount) {
    Future {
      throttler(waitForever())
    }
  }
  throttler {} must throwA[ThrottledException]
}
```

Here we’re creating maxCount threads (the calls to Future {}) that call the waitForever function, which is waiting until the end of the test. Then we try to perform another operation to bypass the *throttler—maxCount + 1*. By design, at this point we should get a ThrottledException. However, while we wait for an exception, one may not happen. The last call for a throttler (with expectation) may occur before one of the futures has started (causing an exception to be thrown in this future but not at the expectation).

The problem with the above test is that we do not ensure all the threads have started and are waiting in the waitForever function before we try to violate the throttler with the expected result of the throttler throwing an exception. To fix it, we need some way to wait until all futures start. Here is an approach that is familiar to many of us: just add a sleep method call with some reasonable duration.

```scala
"throw exception once reached the limit [naive, bad]" in new ctx {
  for (i <- 1 to maxCount) {
    Future {
      throttler(waitForever())
    }
  }
  Thread.sleep(1000)
  throttler {} must throwA[ThrottledException]
}
```

OK, now our test will almost always pass, but this approach is wrong for at least two reasons:
The duration of the test will last only as long as the “reasonable duration” we set.
In very rare situations, like when the machine is under high load,  this reasonable duration won’t be enough.
If you’re still in doubt, [search Google](http://bfy.tw/6tqN) for more reasons.

A better approach is to synchronize the start of our threads (futures) and our expectation. Let’s use *CountDownLatch* class from *java.util.concurrent*:

```scala
"throw exception once reached the limit [working]" in new ctx {
  val barrier = new CountDownLatch(maxCount)
  for (i <- 1 to maxCount) {
    Future {
      throttler {
        barrier.countDown()
        waitForever()
      }
    }
  }
  barrier.await(5, TimeUnit.SECONDS) must beTrue
  throttler {} must throwA[ThrottledException]
}
```

We use *CountDownLatch* for [barrier synchronization](https://en.wikipedia.org/wiki/Barrier_%28computer_science%29). The await method blocks the main thread until the latch count is zero. As the other threads run (let’s denote those other threads as the futures), each of those futures calls the barrier countDown method to lower the latch count by one. Once the latch count is zero, all the futures are inside the *waitForever* method.

By that point, we are ensured that the throttler is saturated, with maxCount threads inside it. An attempt by another thread to enter the throttler will result in an exception. We have a deterministic way to set up our test, which is to try and have the main thread enter the throttler. The main thread can and does resume at this point (the latch count reaches zero and the CountDownLatch releases the waiting thread).

We use a slightly higher timeout as a safeguard to avoid blocking infinitely if something unexpected happens. If something does happen, we fail the test. This timeout won’t affect the test duration because, unless something unexpected happens, we should not wait for it.

##Conclusion
When testing asynchronous code it is quite common to require a specific ordering of operations between threads for a specific test. Not using any synchronization results in flaky tests that sometimes work and sometimes fail. Using Thread.sleep slows down and reduces the flakiness of tests, but it does not solve the problem.

In most cases when we need to enforce ordering between threads in a test, we can use a CountDownLatch instead of Thread.sleep. The advantage of CountDownLatch is that we can tell it when to release the waiting (holding) thread, gaining two important benefits: deterministic ordering, and therefore more reliable tests, and faster running tests. Even for trivial waiting—for example, the waitForever function—we could have used something like *Thread.sleep(Long.MAX_VALUE)*, but it’s always better not to use fragile approaches.

You can find the full code [on GitHub](https://github.com/dkomanov/scala-junk/blob/master/src/test/scala/com/komanov/examples/ThrottlerTest.scala).
