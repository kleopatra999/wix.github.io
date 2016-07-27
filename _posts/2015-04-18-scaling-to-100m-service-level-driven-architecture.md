---
layout: post
title: 'Scaling to 100M: Service-Level Driven Architecture'
date: 2015-04-18 21:49:54.000000000 +03:00
type: post
published: true
status: publish
categories: []
tags: []
meta:
  _edit_last: '8'
author:
  login: yoav@wix.com
  email: yoav@wix.com
  display_name: Yoav Abrahami
  first_name: Yoav
  last_name: Abrahami
---
This blog post is part 3 in the “Scaling Wix to over 100M Users” series. Read the previous posts [here(1)](beginning) and [here(2)](Cache).

Wix started with one server that supported all the different aspects of the Wix service: registering users, editing websites, serving published websites, and uploading images. That one server proved to be the right choice at the time because it enabled Wix to grow quickly and be agile with our software development. However, by 2008 we started experiencing recurring problems with software deployment, which caused unexpected downtime—both for creating sites and for serving live sites.

Deploying a new version of our software, in some cases, required a MySQL schema change. As Hibernate is not forgiving of mismatches between the schema it expects and the actual database (DB) schema, we utilized a common practice of software deployment: a planned two-hour downtime during a low-traffic period (midnight in a U.S. time zone over the weekend). During this planned downtime, we would stop the service, shut down the server, perform the MySQL schema change, deploy the new version, and restart the server.

This two-hour planned downtime often turned out to be more complex because problems would occur during deployment. In some cases, performing the MySQL schema change took considerably longer than planned (altering large tables, rebuilding indexes, disabling constraints for data migrations, etc.). Or sometimes, after performing the schema change and trying to restart the server, it did not start because of some unforeseen deployment, configuration, or schema issues that prevented it from operating. And in other cases, the new version of our software was faulty, so to restore service, we would change the MySQL schema again (to match the previous version) and redeploy the old version of our software.

But the worst cases were when, days after a “successful” deployment, we would discover that the new version had some critical yet rare bug causing user sites to be corrupted. At that point, the safest thing to do was roll back to the previous version (at least until we had a bug fix)—a process that again involved a schema change, which meant an unplanned downtime of our service.

It is important to note that because we were using one server application to serve all of Wix, the downtime impacted our entire service, including the published websites. And as a result of our growing user base, more and more websites were affected by our planned or unplanned downtimes.

And then it hit us. Wix performs two different functions: serving live websites and building websites. Downtime when users are building websites has a direct effect on our daily sales, but downtime for live websites has a direct effect on all our existing, paying customers. We needed to create and define different service levels for each function.

After further analysis, we also found that most of our new or changed features were related to building the websites, whereas only a small number of changed features were about serving the websites. This means we had done frequent releases of software that risked both the building and serving of websites, even though changes were only on the building side.

 | Building websites | Serving websites------------ | ------------- | ------------Number of features | Large, complex requirements | Small, relatively simple requirementsRate of change | High | Low
Impact of downtime | New Wix users | All Wix users and visitors


With this realization, we set out to split our system into two different segments: the **editor segment**, responsible for building websites, and the **public segment**, responsible for serving websites. This solution enabled us to provide different service levels to meet each of our business functions.
The stack selected for building the public segment was intentionally simple. We no longer used Hibernate, we dropped any form of cache, and we started using Spring MVC 3.0. The important design guideline was to make it decoupled from the editor segment—in terms of software, release cycle, and data storage—and to make the software stack simple to comprehend and optimized for serving sites.

The manifest of this decoupling was the publishing process (of which a derivative is still at the core of Wix), which copied data from the editor segment DB to the public segment DB. This process transformed the data structures from what was efficient for editing to what performed best for a published site.

![Scaling Design](../images/Scaling-Wix-Design/Scaling-Wix-to-over-100M-Architechture.jpg)

The result of this process was a low risk, low rate of deployment public segment that is still alive within Wix, six years after it was first deployed (though a bit has changed since then).

##What did we learn?
We already understood that the release cycle introduced risk, but we realized that it impacted our two major business functions—building websites and serving websites—differently. So, we learned that we needed to have different service levels for each function, and that we had to architect our system around them.
What are those different service levels? The aspects we considered were availability, performance, risk of change, and time to recover from failure. The public segment, which affects all Wix users and websites, needed to have the highest service level with regard to all of those aspects.

But for the editor segment, failure only affects users in the process of building websites, so the business impact is lower. This allowed us to trade off a high service level for better agility, which saved development effort.
Today when we add new functions to our system, we first ask what is the required service level, and we then determine where to position that new function in our architecture.