---
layout: post
title: Color Your Logs and Stack Traces
date: 2015-05-21 14:24:33.000000000 +03:00
type: post
published: true
status: publish
categories:
- Java
- Tips and Tricks
tags: []
meta:
  _edit_last: '29'
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: logs
  _yoast_wpseo_metadesc: How to add colors to logs
  _yoast_wpseo_linkdex: '91'
  _thumbnail_id: '722'
author:
  login: laurentg@wix.com
  email: laurentg@wix.com
  display_name: Laurent Gaertner
  first_name: Laurent
  last_name: Gaertner
---
At Wix we produce gigabytes of logs for different applications every day. Logs are not the only way we monitor our systems, but they play an important role, both for troubleshooting purposes and to check the general health of an application.

One of the problems we had was the readability of logs. When you know what you’re looking for in a log, it is easy to search for an exception. But when you don’t know what is wrong, going through gigabytes of logs in white text on a black background can be very time consuming and onerous.

Our solution was to add colors to our logs to facilitate the readability. Wouldn’t it be great if every level (i.e., info, warning, error) message had a different color? What if we could have different colors in our stack trace to highlight different exceptions?

Before jumping into the details of the implementation, let’s first understand how the coloring works in Unix.

An easy way to understand it is to type the following in a Unix terminal:

<pre style="margin-bottom: 18px; font-family: 'courier', serif; background-color: #000000; color: #ffffff;">
echo -e "\033[31mException log\033[39m"
</pre>


The result is:

<pre style="margin-bottom: 18px; font-family: 'courier', serif; background-color: #000000; color: #ff0000;">Exception log</pre>

##What happened?
First, it’s important to know that every color has a corresponding ANSI color code:

* Black = 30
* <span style="color: #ff0000;">Red</span> = 31 = 31
* <span style="color: #008000;">Green</span> = 32 = 32
* <span style="background-color: #ffff00; color: #000000;">Yellow</span> = 33
* ...
* <span style="background-color: #000000; color: #ffffff;">Default</span> = 39

For the color codes to take effect, they need to be preceded by the "start" escape character, *\033[*, and be followed by the "end" escape character, *m*.

Therefore, to display a message in red, we would type the following:
<

<span style="font-family: courier;">\033[</span><span style="color: #ff0000;">31</span><span style="font-family: courier;">m</span>

We then need to set the color back to the default color; otherwise, everything in the terminal will be displayed in red from that point on.
To do this, we would type:

<span style="font-family: courier;">\033</span>[<span style="background-color: #000000; color: #ffffff;">39</span><span style="font-family: courier;">m</span>

Fortunately we are using Logback to produce our logs, which provides an easy way to [add colors](http://logback.qos.ch/manual/layouts.html).
It is also possible to use the existing <span style="font-family: courier;">%highlight</span> keyword to display messages in different colors depending on the error level.

We want to have our logs colored in a very specific way, so we’ll need to create our own keyword. This keyword will be linked to a customize class that will contain our specific logic.
A stack trace consists of different lines, all corresponding to classes with their full package. We would like to color these lines depending on their corresponding packages. Some lines don’t need to be colored at all.

This is our full implementation using Scala:

![Colorful Logs](../images/Color-Your-Logs/ColorfulLog1.png)

* Line 12: Class <span style="font-family: courier;">StracktraceLogHighlighter</span> extends abstract class <span style="font-family: courier;">CompositeConverter</span>.
* Line 14: Override the abstract method <span style="font-family: courier;">transform</span>.
* Lines 14-21: Loop through each line in the stack trace. For each line, call method <span style="font-family: courier;">lineColouring</span>.
* Lines 23-29: Lines will be analyzed here using Scala Extractors. The Extractors will output the color code (e.g., 30, 31, etc.) for a given line. If none of the Extractors returns a value, then the line will be displayed without a color.
* Lines 31-34: Implementation of <span style="font-family: courier;">ImportantWixLine</span> Extractor. If the line contains "com.wixpress.framework." or "com.wixpress.hoopoe.", it returns color code Magenta (35).
* Lines 36-39: Implementation of <span style="font-family: courier;">WixLine</span> Extractor. If the line contains "com.wix", it returns color code Yellow (33).
* Lines 41-42: This method will display the given line in a color (see example above for detailed explanation). It is called for each line in the <span style="font-family: courier;">lineColouring</span> method.

We can now link this class with our new <span style="font-family: courier;">stacktraceHighlight</span> keyword in the *logback.xml* file:

```xml
<conversionRule conversionWord="stacktraceHighlight" converterClass="com.wixpress.framework.logging.StacktraceLogHighlighter" />
```

The <span style="font-family: courier;">encoder</span> part in our The <span style="font-family: courier;">encoder</span> part in our <span style="font-family: courier;">appender</span> will look like:

```xml
<encoder>
 <pattern>%d{HH:mm:ss.SSS} %highlight(%-5level) %stacktraceHighlight(%rEx) %nopex
 </pattern>
</encoder>
```

<span style="font-family: courier;">%stacktraceHighlight(%rEx)</span> will apply our code to the exception stack trace. We use <span style="font-family: courier;">%nopex</span> to avoid having our exception displayed a second time without coloring.

The following commands can be used in order to see the colors displayed properly in the logs:
<span style="font-family: courier;">tail, more, cat,</span> or <span style="font-family: courier;">less -R</span>. The <span style="font-family: courier;">-R</span> option causes "raw" control characters to be displayed.

![Colorful Logs](../images/Color-Your-Logs/ColorfulLog2.png)

When opening this log with <span style="font-family: courier;">vi</span>, we can see the color codes around each line:

![Colorful Logs](../images/Color-Your-Logs/ColorfulLog3.png)

I hope you enjoy your colorful logs!
