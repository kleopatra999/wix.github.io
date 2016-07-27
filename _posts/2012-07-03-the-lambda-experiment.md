---
layout: post
title: The Lambda Experiment
date: 2012-07-03 14:15:32.000000000 +03:00
type: post
published: true
status: publish
categories:
- Java
tags:
- functional programming
- java
- LambdaJ
meta:
  _edit_last: '8'
  _syntaxhighlighter_encoded: '1'
author:
  login: yoav@wix.com
  email: yoav@wix.com
  display_name: Yoav Abrahami
  first_name: Yoav
  last_name: Abrahami
---
I've recently started coding in Scala (recently being over a year ago). While I dislike Scala companion religion 'everything  functional', I do like some of the language features that Scala provides - pattern matching, lambdas, traits and some. I had a discussion with a friend regarding implementing something as close as possible to Scala Lambdas in Java - which resulted in The Lambda Experiment - here is the story of the attempt, what it does and why I abandoned it.

It is important to note that this experiment, while not production ready, does show a number of interesting technics in Java (which can be implemented just the same with any other JVM language, Scala included).  We demonstrate the nature of Java, being **statically typed dynamic language**. We implement the dynamic nature of Java in this example using the Javassist library to generate Java classes at runtime. It is important to note that there are other mechanisms for dynamic coding in Java, such as JDK Proxy and other bytecode level libraries, but that is out of the scope of this post.

We were inspired by a number of sources - the proposals for Java 8 Lambdas, The Scala programming language and some projects trying to do things like Lambdas for Java (e.g. **LambdaJ**). The functional code  (functions body) is written as a String (the Java compiler sees it as a string) that is compiled using the javassist compiler, loaded at runtime and used to implement SAM (Single Abstract Method) interfaces.

##Example of The Lambda Experiment
The lambda experiment enables writing a list.map as

```java
aList.map(Integer.class, "a*a");
```
which is equivalent to the Scala code

```java
aList.map(_*_)
```

We have implemented three examples of the List map operation. All three perform the same operation - returns a new list of integers with the square of each element of the original list.

```java
aList.map(Integer.class, "a*a");
aList.mapTo(Integer.class).with("a*a");
aList.map(Lambda(Integer.class, var(Integer.class)).build("a*a";));
```

The Lambda Experiment also supports binding variables from the enclosing scope such as

```java
int x = 6;
aList.map(Integer.class, "a*a+b", val(x));
aList.map(Integer.class, "a*a+x", val("x", x));
```

which is equivalent to the Scala code

```java
val x = 6
aList.map(_*_+x)
```

The val function binds a value to a variable name that can be used within a function body.

In addition, The Lambda Experiment supports SAM (Single Abstract Method) Interfaces, which enables reusing existing Java interfaces that take SAM parameters as inputs. A Good example is the Collections.sort operation which accepts a Comparator SAM.

```java
Collections.sort(aList, Lambda(Comparator.class, Float.class).build("(a<b?1:(a<b?-1:0))"));
Collections.sort(aList, Lambda(Comparator.class, Integer.class).build("a-b"));
```

or with a simple factory

```java
@Factory
private <T> Comparator<T> Comparator(Class<T> ofType, String code) {
    //noinspection unchecked
    return Lambda(Comparator.class, ofType).build(code);
}
Collections.sort(aList, Comparator(Integer.class, "(a<b?1:(a<b?-1:0))"));
```

##How does it work?
The main idea of the lambda experiment is coding at timetime. We take a string which is the code of a method body and compile it at runtime to generate a new Java class, load that class and use it to create an instance of a SAM interface.  In affect, we have implemented a two step process

```java
Lambda(signature) --> LambdaSignature
LambdaSignature(body, vals) --> Java instance implementing the signature
```

We have implemented two styles of Lambda signatures - using provided SAM interface or for the creation of FunctionN implementations.

A SAM is, as stated above, a single method interface, such as Comparator

```java
Comparator<T> {
    int compare(T o1, T o2);
}
```

The FunctionN interfaces are simply defined as

```java
public interface Function1<R, T> extends SelfDescribingFunction<R> {
    public R apply(T t);
}
public interface Function2<R, T1, T2> extends SelfDescribingFunction<R>{
    public R apply(T1 t1, T2 t2);
}
```

The Lambdas (Lambdas.java) class exposes the static methods for Lambda creation of both styles
The methods for creation of FunctionN Lambdas

```java
public static <R,T> LambdaSignature<Function1<R,T>> Lambda(Class<R> retType, Var<T> var1)
public static <R,T1, T2> LambdaSignature<Function2<R,T1, T2>> Lambda(Class<R> retType, Var<T1> var1, Var<T2> var2)
public static <R,T1, T2, T3> LambdaSignature<Function3<R,T1, T2, T3> Lambda(Class<R> retType, Var<T1> var1, Var<T2> var2, Var<T3> var3)
```

The methods for creation of SAM Lambdas

```java
public static <SAM> SAMSignature<SAM> Lambda(Class<SAM> samType)
public static <SAM> SAMSignature<SAM> Lambda(Class<SAM> samType, Class<?> ... genericTypes)
```

The LambdaSignature class is a factory class that, given a code and a set of variable bindings, will use the LambdaClassGenerator to actually generate a class implementing the F interface.
The actual compilation and loading of classes at runtime is done using the LambdaClassGenerator class (**LambdaClassGenerator.java**)

Checkout the generateClass() method - it does the following:

* Generates the code of our class, each method and field separately.
* Creates Javassist ClassPool and configures it with the relevant classpath
* Creates Javassist CtClass object
* Adds parent interface to the CtClass and all the fields and methods
* Calls ctClass.toClass() to get the actual Java Class object of our newly created class
* Then we use reflection to get the class constructor and create an instance of that class.

How does the code generation works? Given the following Lambda

```java
Lambda(Integer.class, var(Integer.class), var(Integer.class)).build("a+b+c", val(12));

```
LambdaClassGenerator will generate the following class code, compile it using Javassist and load it as explained above

```java
class Lambda$$1340129336 implements org.wixpress.hoopoe.lambda.Function2 {
    int c;
    public Lambda$$1340129336(java.lang.Integer c) {
        this.c = ((Integer)c).intValue();
    }
    public Object apply(Object a, Object b) {
        return new Integer(invokeInternal(((Integer)a).intValue(), ((Integer)b).intValue()));
    }
    int invokeInternal(int a, int b) {
        return a+b+c;
    }
    public Class retType() {
        return java.lang.Integer.class;
    }
    public Class[] varTypes() {
        return new Class[] {java.lang.Integer.class, java.lang.Integer.class};
    }
}
```

When using the SAMSignature<SAM> factory methods, we create a Lambda just like the above, and then implement the SAM using the JDK Proxy.

##Limitations of the Lambda Experiment Project

The Lambda Experiment was built as a prof of concept and as such, we did not invest in proving all the features required by a production library. We did not implement the following:

* Multiple line expressions. The Lambda Experiment assumes that the string expressions passed to the build method are single line expressions, that are always wrapped with return {expression};.
* Functions with over 3 parameters. It is trivial to add those - not interesting for experiment scope.
* Curry operations - transform a Function3 into Function2 by providing a variable value. This seems trivial and as such, was not implemented.
* Functional Collections - the project does not implement another set of functional collection libraries for Java, such as LambdaJ or Guava. The Lambda Experiment can be used with such existing libraries or used to create additional such libraries.

##Why did we abandon the project?
The Lambda Experiment exposed some limitations of the Javassist project as well as some limitations imposed by its approach.

* The first and most annoying limitation is that Javassist syntax is pre-java 5. It does not wrap and unwrap primitives as the Java 5+ compiler does.
* Another limitation is that because the code is compiled as a new class and not as an inner class, it cannot reuse the imports list of the declaring class nor can we use variables declared in scope.

The impact of the two above limitations is that when in Scala or Java 8 lambdas we can write

```java
Import java.util.BigInteger;
…
Void f(final Integer factor) {
   List<Integer> list = getSomeList();
   List<BigInteger> newList = list.map( item --> new BigInteger(item * factor));
}
```

But with the Lambda Experiment we will need to do (assume we implement a map method that takes a string body and var args Val input)

```java
Import java.util.BigInteger;
…
Void f(final Integer factor) {
   List<Integer> list = getSomeList();
   List<BigInteger> newList = list.map("new java.util.BigInteger(a * b)", val(factor));
}
```

##What can we learn from this experiment?

* It shows how we can create new java classes at runtime and use them just like any other class.
* It shows the nature of Java - it is statically typed, requiring interface definitions at compile time.
* However, Java is dynamic - we can implement those interfaces at runtime using the JDK Proxy and the creation of classes at runtime.

