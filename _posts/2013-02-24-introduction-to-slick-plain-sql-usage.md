---
layout: post
title: 'Introduction to Slick: Plain SQL Usage'
date: 2013-02-24 18:26:44.000000000 +02:00
type: post
published: true
status: publish
categories:
- Scala
tags:
- '2.10'
- interpolation
- scala
- slick
- sql
- typesafe
meta:
  _edit_last: '43'
  _syntaxhighlighter_encoded: '1'
  _wpas_done_all: '1'
author:
  login: kfirb@wix.com
  email: kfirb@wix.com
  display_name: Kfir Bloch
  first_name: ''
  last_name: ''
---
In this post I will cover usage of the Slick library, which provides a Scala-centric API over JDBC.

Slick offers 3 flavors for querying the DB; I will focus on the plain SQL flavor.
Note: Slick is only compatible with Scala 2.10.

Maven dependency:

```xml
<dependency>
<groupId>com.typesafe.slick</groupId>
<artifactId>slick_2.10</artifactId>
<version>1.0.0</version>
 </dependency>
```

DB table:

```sql
CREATE TABLE animals (
  id varchar(50)  NOT NULL,
  name varchar(256)  NOT NULL,
  date_created_nano bigint(20) not NULL,
  PRIMARY KEY  (id)
);
```

We will represent the Animal domain object using the following case class:
```scala
case class Animal(id: UUID, name: String, dateTime: DateTime)
```

Note: The first parameter is complex type (UUID) and the third parameter is also complex type (Joda DateTime).
We will hide all DB operations using a DAO, as described by the following trait:

```scala 
</span>
<pre>trait AnimalDao {
  def allAnimals: Seq[Animal]
  def animalById(id: String): Option[Animal]
  def deleteAnimalById(id: String): Int
}
```

And the implementation:

```scala
import scala.slick.session.Database
import Database.threadLocalSession
import slick.jdbc.{StaticQuery => Q, GetResult}
import javax.sql.DataSource
import Q.interpolation
import org.joda.time.DateTime
import java.util.UUID
class DefaultAnimalDao(dataSource: DataSource) extends AnimalDao {
  lazy val db = Database.forDataSource(dataSource)
  def allAnimals: Seq[Animal] = {
    db.withSession {
      Q.queryNA[Animal](&quot;select * from animals&quot;).list
    }
  }
  def animalById(id: String): Option[Animal] = {
    db.withSession(
      sql&quot;select * from animals where id = $id&quot;.as[Animal].firstOption
    )
  }
  def deleteAnimalById(id: String): Int = {
    db.withSession(
      sqlu&quot;delete from animals where id = $id&quot;.first
    )
  }
  implicit val getAnimalsResult = GetResult(r => Animal(UUID.fromString(r.nextString), r.nextString, new DateTime(r.nextLong())))
}
```

* The DAO is dependent on a javax.sql.DataSource.
* In the second line, we created a Slick Database object using the provided DataSource.
* allAnimals() uses the queryNA[Animal] function and returns a Seq of Animals.
* animalById() uses the sql String interpolator. The .as[Animal] method tells the function to return an instance of Animal, and .firstOption() returns only the first result, wrapped in an Option.
* deleteAnimalById() uses the sqlu String interpolator for update/insert. The result is always an Int representing the number of affected trows.
* The implicit val getAnimalResult is very important. It tells Slick how to create the object, and it encapsulates the logic constructing the complex types mentioned earlier.

