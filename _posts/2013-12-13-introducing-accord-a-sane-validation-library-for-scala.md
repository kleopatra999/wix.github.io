---
layout: post
title: 'Introducing Accord: a sane validation library for Scala'
date: 2013-12-13 19:55:39.000000000 +02:00
type: post
published: true
status: publish
categories:
- Scala
tags:
- Accord
- scala
meta:
  _edit_last: '17'
  foobar_type: default
  foobar_select: '0'
  _syntaxhighlighter_encoded: '1'
  _post_restored_from: a:3:{s:20:"restored_revision_id";i:583;s:16:"restored_by_user";i:17;s:13:"restored_time";i:1386848029;}
  _wpas_done_all: '1'
author:
  login: tomerga@wix.com
  email: tomer@tomergabel.com
  display_name: Tomer Gabel
  first_name: Tomer
  last_name: Gabel
---
[Accord](https://github.com/wix/accord) is an open-source (Apache-licensed) Scala validation library developed at Wix. It's [hosted on GitHub](https://github.com/wix/accord) and you're welcome to fork and dig into it; let us know what you think!

##Why another validation library?
As we were transitioning from Java to Scala we've started hitting walls with the existing validation libraries, namely JSR 303 and Spring Validation. While there are a few validation frameworks written for Scala, notably [scalaz](https://github.com/scalaz/scalaz) with its validation features, after evaluating them we remained dissatisfied and ended up designing our own. If you're interested, there's more background and comparisons with existing frameworks on the [project wiki at](https://github.com/wix/accord/wiki/Rationale) GitHub.

##So what does it a look like?
A type validator is defined by providing a set of validation rules via the DSL:

```scala
import com.wix.accord.dsl._    // Import the validator DSL

case class Person( firstName: String, lastName: String )
case class Classroom( teacher: Person, students: Seq[ Person ] )

implicit val personValidator = validator[ Person ] { p =&gt;
  p.firstName is notEmpty                   // The expression being validated is resolved automatically, see below
  p.lastName as "last name" is notEmpty     // You can also explicitly describe the expression being validated
}

implicit val classValidator = validator[ Classroom ] { c =&gt;
  c.teacher is valid        // Implicitly relies on personValidator!
  c.students.each is valid
  c.students have size &gt; 0
}
```

You can then execute the validators freely and get the result back. A failure result includes its respective violations:

```scala
scala&gt; val validPerson = Person( "Wernher", "von Braun" )
validPerson: Person = Person(Wernher,von Braun)

scala&gt; validate( validPerson )
res0: com.wix.accord.Result = Success

scala&gt; val invalidPerson = Person( "", "No First Name" )
invalidPerson: Person = Person(,No First Name)

scala&gt; validate( invalidPerson )
res1: com.wix.accord.Result = Failure(List(RuleViolation(,must not be empty,firstName)))

scala&gt; val explicitDescription = Person( "No Last Name", "" )
explicitDescription: Person = Person(No Last Name,)

scala&gt; validate( explicitDescription )
res2: com.wix.accord.Result = Failure(List(RuleViolation(,must not be empty,last name)))

scala&gt; val invalidClassroom = Classroom( Person( "Alfred", "Aho" ), Seq.empty )
invalidClassroom: Classroom = Classroom(Person(Alfred,Aho),List())

scala&gt; validate( invalidClassroom )
res3: com.wix.accord.Result = Failure(List(RuleViolation(List(),has size 0, expected more than 0,students)))
```

##Design goals
Accord was designed to satisfy four principal design goals:

* **Minimalistic**: Provide the bare minimum functionality necessary to deal with the problem domain. Any extended functionality is delivered in a separate module and satisfies the same design goals.
* **Simple**: Provide a very simple and lean API across all four categories of call sites (validator definition, combinator definition, validator execution and result processing).
* **Self-contained**: Reduce or eliminate external dependencies entirely where possible.
* **Integrated**: Provide extensions to integrate with common libraries and enable simple integration points where possible.

The first milestone release (0.1) already includes a substantial set of combinators (Accord's terminology for discrete validation rules, e.g. IsEmpty or IsNotNull), a concise DSL for defining validators, result matches for [ScalaTest](http://www.scalatest.org/) and [Specs²](http://etorreborre.github.io/specs2/), and integration facilities for [Spring Validation](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/validation.html).

Accord's syntax is specifically designed to **avoid user-specified strings** in the API (this includes scala.Symbols). In practical terms, this means it doesn't use reflection at runtime, and furthermore can **automatically generate descriptions** for expressions being validated.

In the above example, you can see that RuleViolations can include both implicit (as in firstName) and explicit (as in lastName) descriptions; this feature enables extremely concise validation rules without sacrificing the legibility of the resulting violations.
