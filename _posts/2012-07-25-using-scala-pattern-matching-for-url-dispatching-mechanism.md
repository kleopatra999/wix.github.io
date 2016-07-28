---
layout: post
title: Using Scala Pattern Matching for a URL dispatching mechanism
date: 2012-07-25 22:44:49.000000000 +03:00
type: post
published: true
status: publish
categories:
- Scala
tags:
- pattern matching
meta:
  _edit_last: '5'
  _syntaxhighlighter_encoded: '1'
author:
  login: shaiy@wix.com
  email: shaiy@wix.com
  display_name: Shai Yallin
  first_name: Shai
  last_name: Yallin
---
At Wix.com, we deal quite a lot with URL dispatching, being a company that handles editing, hosting and serving user-generated websites. Naturally, our codebase deals with various URL patterns and needs to be testable and maintainable. In addition, proper web etiquette dictates that we never cease support of existing URLs, even after they are deprecated in favor of new ones. Instead, we must redirect (HTTP 301) from the old URL to the new one.

When serving websites created using our HTML Editor, we currently deal with the following URL patterns (relative to some root domain such as example.wix.com):

* "/" - which indicates that we should render the site's home page
* "/page-id" -  was deprecated in favor of the more SEO-friendly:
* "/page-title/page-id", which we must redirect to
* "/image-id" - which was deprecated in favor of:
* "/image-title/zoom/page-id/image-id", which we must redirect to

In both the second and third example, the title fragment of the URL is meaningless in terms of dispatching, as we only use the page id in order to determine the page to render. Furthermore, if the user has edited the page (or image) title, we must redirect any existing URLs that contain the old title to a canonical URL that contains the new title. We also want to return HTTP 404 for any URL pattern we'r"e not familiar with.

As you might have already guessed, this makes for a seriously complicated, Spaghetti Al Arrabbiata code of nested if-else blocks. Or at least, it did, until we decided to convert it to Scala.

There are 3 main advantages to using Scala over Java which, once you've gotten used to, you can't fathom how you ever lived without them. These are [Traits](http://docs.scala-lang.org/tutorials/tour/traits.html), [Pattern Matching](http://docs.scala-lang.org/tutorials/tour/pattern-matching.html) and [Lambda Expressions](http://docs.scala-lang.org/tutorials/tour/anonymous-function-syntax.html). In order to solve the URL dispatching, we made heavy usage of List Pattern Matching and [Case Classes](http://docs.scala-lang.org/tutorials/tour/case-classes.html), which makes for a very declarative approach to URL parsing, resolution and dispatching:

```scala
def resolvePath: Resolution = path.toList match {
  case Nil => DispatchMainPage()
  case id :: Nil => RedirectToPageOrImage(id)
  case seoTitle :: id :: Nil => RenderPage(id, seoTitle)
  case seoTitle :: "zoom" :: pageId :: imageId :: Nil => DispatchImageZoom(seoTitle, pageId, imageId)
  case _ :: appId :: tail if tail.size == 2  => NotFound("Got request for deep link of unknown app type [%s]", appId)
  case _ => NotFound("Path [%s] is of an unrecognized pattern", path)
}
```

What happens here is that we take our path (broken into directories split by the forward slash character and represented by a java.util.List), turn it into a scala.collection.immutable.List using an [implicit conversion](http://www.scala-lang.org/node/130), then apply a set of cases against it using pattern matching. Scala's [unapply](http://www.scala-lang.org/node/112) method "deconstructs" the list into its elements, allowing us to refer to them individually in our different match cases. Each case returns a different instance of a case class, all of them extending the Resolution trait. Another piece of code, not shown here, accepts an instance of Resolution and handles it - also using pattern matching.

Let's go over the cases together. The first case is simple - an empty list (a list with only one element, which is the predefined Nil element) is a request for the main page. The second is also simple - a list of a single element is either a request for an image or a page, and in both page should result in a redirect. We return a case class, aptly named, and send it back to our handler. Note that we assign the sole member of the list to a variable named 'id', which we then send as a parameter to our case class. The third case is very similar to the second case, but this time expecting two elements and assigning them both to variables, passed to the RenderPage case class.

The fourth and fifth cases are where it gets really interesting. In the fourth case, we expect a path of exactly 4 elements, where the second one is the string "zoom". We pass the other 3 elements to an appropriate case class. In the fifth case, we're looking for any other 4-part pattern where the second element is unfamiliar. This is a separate case because we're going to add other handlers for 4-part paths, the second element of the path being the discriminator between the different handlers. If we encountered a discriminator we're not familiar with, we send a special 404 message indicating this. Note that the first element is the underscore character, which is Scala for 'wildcard'. In this context, it means "we don't care about this element". Also note that this case doesn't end with :: Nil - it ends with a variable named 'tail' and a guard clause, meaning that it will only match the pattern if tail is a sub-list of exactly two elements.

Finally, the sixth case is simply a wildcard, indicating that for any path that doesn't match any of the above, we return a default 404 message.
