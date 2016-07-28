---
layout: post
title: Lifecycle – Dependency Management Algorithm (Part 2 of the Lifecycle Series)
date: 2013-09-01 15:16:28.000000000 +03:00
type: post
published: true
status: publish
categories:
- Java
- Tips and Tricks
tags: []
meta:
  _edit_last: '15'
  foobar_type: default
  foobar_select: '0'
  _wpas_done_all: '1'
author:
  login: ory@wix.com
  email: ory@wix.com
  display_name: Ory Henn
  first_name: Ory
  last_name: Henn
---
In the previous post in the series I introduced Lifecycle – Wix’ integrated CI/CD action center. In this post I’d like to share a bit of nifty math I threw in a couple of months ago, which allowed us to save about 60% of our CI resources.  I’ll start with a brief overview of our setup and the problem it caused, and then move on to a little fun math for the geeks out there.

##So where’s that overview you promised?
Here it is. Our build and release process is undergoing some changes as we attempt to scale CI tools and methods to adjust for rapid company growth. Our current setup includes 2 TeamCity servers, one called ‘CI’ and the other ‘Release’. In olden days (last year), the CI server had builds running on every Git commit (to the specific project), using latest snapshot version of internal artifacts. The release server had the same configuration, and ‘releasing’ a build meant building it again, with the release version of all our internal artifacts, after which it could be deployed to production.

We have recently switched to a setup where each build in the CI server has automatically configured snapshot dependencies on all other relevant builds, and the Git trigger is configured to run when any of the dependencies change. This means that on any commit to a project, it is built along with all projects which depend on it. Among other things, this allowed us to move to a ‘quick release’ mode, where releasing a build means merely taking the latest snapshot and changing its name (well, some other stuff too, but nothing that has to do with the compiled code itself).

##Well, that’s all very cool. Where’s the problem?
The problem is that we have quite a lot of projects going on. Before we started doing dependency reduction, our setup included about 220 build configurations, with almost 700 dependencies between them. On the first couple of times we tried to make this process work, we inflated the TeamCity build queue to many hundreds of builds, leading to extreme slowness, Git connections getting stuck, and in some cases the server crashing completely.

A few of these incidents exposed real TeamCity issues or places for optimization. But the clear conclusion was that we needed to reduce the number of builds, especially the number of ones trying to run concurrently. Since when you add a build to the queue in TeamCity all its snapshot dependencies are added as well (at least until suitable previously existing artifacts are found), this essentially meant reducing the number of dependencies.

##Interesting. How do you reduce the number of dependencies?
Well, here’s where nifty math starts to creep in. The important thing to remember here is that the structure of snapshot dependencies between builds is a Directed Acyclic Graph, or DAG.  A graph is a collection of vertices (build configurations in our case), and edges (dependency relations). Each edge connects exactly two vertices. The graph is directed, meaning that each edge has a direction. In our case, a dependency between builds A and B means that A is dependent on B, but not the other way round. The graph is also acyclic (i.e. having no cycles), as a build cannot ultimately depend on itself (in fact, TeamCity throws an error if you try to define dependencies that form a cycle).

Now, what we want to do is take our graph of dependencies and remove all redundant edges. A dependency of A on B is redundant in this case if A is already dependent on B through some other path. For example, if A is dependent on B and C, and B is also dependent on C (3 edges in total), we can safely remove the dependency of A on C, and still know that a build of C will trigger a build of A (because it will trigger B, on which A is still dependent).

As it turns out, in Graph Theory this concept is called ‘Transitive Reduction’, and that for a DAG the transitive reduction is unique. From the [Wikipedia entry](https://en.wikipedia.org/wiki/Transitive_reduction#In_directed_acyclic_graphs): “The transitive reduction of a finite directed graph G is a graph with the fewest possible edges that has the same reachability relation as the original graph. That is, if there is a path from a vertex x to a vertex y in graph G, there must also be a path from x to y in the transitive reduction of G, and vice versa. The following image displays drawings of graphs corresponding to a non-transitive binary relation (on the left) and its transitive reduction (on the right).”

![DAG Diagram](../images/Lifecycle-Dependancy-Management-Algorithm/Diagram1.png)

The same wiki entry also tells us that the computational complexity of finding the transitive reduction of a DAG with n vertices is the same as that of multiplying Boolean matrices of size n * n, so that’s what we set out to do.
We Were Promised Some Math, I Recall…
Ok, here’s where it gets nerdy. A graph with k vertices may be trivially represented as a k * k matrix G, where the value at Gi,j is 1 if there is an edge from i to j, and 0 otherwise.

Now, a nice trait of the matrix representation of a graph is that can be easily used to find paths between vertices. For example, if we raise the matrix of a graph to the 2nd power, we get a new matrix of the same size G2, where the value at G2i,j is the number of paths of length 2 from i to j (i.e. the number of vertices v that have an edge from i to v and edge from v to j). The same goes for any other natural power (the proof is pretty simple, and left as an exercise 
for the reader).

Now, consider that any edge from i to j in our original graph is redundant if there is a value greater than 0 at Gni,j for some n>1. This is because a positive value indicates a path of length n from i to j, so we can naturally remove the direct edge and still be assured that j can be reached **[1](#1)** from i.

Since our graph has k vertices and no cycles, the longest dependency chain possible is of length k-1. This means that any power of G greater than k-1 will be a null matrix. In fact, if our longest dependency chain is of length k’, any power of G greater than k’ will be a null matrix.

This gives us an easy way to find redundant edges in our original graph. We compute the powers of G from 2 upwards, until we get to a null matrix. Then we take G, the sum of all these powers, and set Gi,j to 0 wherever G`i,j is greater than 0. This is equivalent to removing every edge that has an alternative path of length 2 or greater, which is exactly what we set out to do **[2](#2)**.

A minor point of interest here is that previous proofs of this algorithm (such as the one by Aho, Garey and Ullman below) have only gone as far as to show that once you have identified the redundant edges, you can remove any one of them, and then you have to compute the redundancies all over again.

It is, however, easily proven by induction that if you can remove one redundant edge, you can remove them all at the same time, as long as the graph is acyclic. Indeed, if the graph has cycles, our entire algorithm is faulty, and will end up removing many more edges than we want.

This proved a serendipitous discovery, since once you have a matrix representation of a graph, cycle detection is extremely easy. Recall that when looking at G2 we know that the value at G2i,j is the number of paths of length 2 from i to j. Naturally, this means that if we have a non-zero value at some G2i,i along the diagonal of G2, there is a cycle of length 2 from i to itself.
This is true for any power matrix of our graph, so we added a cycle detector to our dependency manager. After calculating a power matrix, we check that the trace (sum of the values along the diagonal of the matrix) is 0. If the trace is not 0, we locate the cycles and alert about them, leaving the dependency structure unchanged until the issue is resolved.

##Does This Really Work?
As you may recall from the start of this post, when we started working on this mechanism we had 220 build configurations, with about 700 dependencies between them. Attempts at activating any sort of automatic dependency chains caused TeamCity build queue to swell up with many hundreds of builds, resulting in stuck Git connections, server crashes, and other shenanigans.

In contrast, we now have about 50% more projects. The last run of the dependency manager covered 310 build configurations, resulting in only 234 dependencies post-reduction. TeamCity queues rarely go over a hundred builds, and most of these are quickly disposed of as artifacts built from the same code revision already exist. This means that we were able to activate the automatic dependencies while keeping the ratio of time builds spend in a queue to time of actually building from going up.

<hr />

<a name="1"></a> [1] This is only true since we implicitly assume the graph has no edge from a vertex to itself. This is trivial in our case, since a build never depends on itself.


<a name="2"></a> [2] For a more rigorous proof, see: Aho, A. V.; Garey, M. R.; Ullman, J. D. (1972), "The transitive reduction of a directed graph", SIAM Journal on Computing 1 (2): 131–137, doi:10.1137/0201008, MR 0306032.


