---
layout: post
title: Integration Tests in JavaScript That Don’t Suck
date: 2014-12-08 20:32:33.000000000 +02:00
type: post
published: true
status: publish
categories:
- JavaScript
- TDD
- Tips and Tricks
- Web Development
tags: []
meta:
  _edit_last: '43'
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: javascript, tests, angular, protractor
  _yoast_wpseo_linkdex: '61'
author:
  login: Sergeyb
  email: sergeyb@wix.com
  display_name: Sergey Bolshchikov
  first_name: Sergey
  last_name: Bolshchikov
---
Most developers don't like writing integration tests. But what’s not to like?
Integration tests ensure that a newly added feature provides the correct interaction—as it was defined in the first place—and confirm that the same feature doesn’t break any existing functionality. However, the nightmare quickly begins: maintaining integration tests. The addition of even a small item to a navigation bar may result in 40% of the tests suddenly failing.

This article considers the traditional approach vs. the page objects technique. The page objects technique raises the level of abstraction of your integration tests so that minimal or no changes are required for test maintenance.

##Traditional Approach
Let’s consider a simple webpage that consists of a filters list on the left side and a main block on the right, as presented in the image below. The main block is displaying data based on the active filter.

![Image 1](../images/Intergration-Tests-in-JavaScrpt-That-Dont-Suck/1.png)

One of the classic implementations of the list is using the ul li tags. The obvious way to test this list is to rely on the ul li structure to find filters in the DOM. For instance, with jQuery, the code could be:

```javascript
$(‘ul > li > a.filter’)
```

But what happens if you change the implementation of the list to divs? 
Typically, many tests will fail. Why will they fail? Because their implementation is strongly tied to the structure of the page.
By introducing the page object, you raise the level of abstraction over the page so that the test uses the page object. The page objects will then be aware of the page structure.
Raising Abstractions
A Page Object is a conceptual model of a certain part of the UI with its own properties and methods. Its purpose is to provide an abstraction layer that will describe the users’ interactions with the page, decoupled from its actual implementation.

The page diagram shown above can be deconstructed into Main, Filters, and Item objects, as shown here:

![Image 2](../images/Intergration-Tests-in-JavaScrpt-That-Dont-Suck/2.png)

Page objects are aware of the entire page implementation, encapsulating the DOM selectors, click handlers, and other implementation details of the page.
For instance, let’s consider the filters object in the above page. We can define a Filters JavaScript class with its attributes and methods. It has a reference to the filters DOM container, which then references the list. The filters class can be implemented using the [Angular Protractor](http://www.protractortest.org/#/) in the following way:

```javascript
function Filters() {
  this.container = element(by.css(‘.filters-container’));
  this.list = element.all(by.repeater(‘filter in filters’));
  this.select = function (label) {
    element(by.cssContainingText(‘.filter-item’, label)).click();
  };
  this.isSelected = function (label) {
    return this.container.element(by.css(‘selected’))
      .then(function(text) {
        return text === label;
      });
    };
}
```

Once we have the filters class, we can use its attributes and methods in test scenarios. Attributes are used to check the correct view of the filter list (what data is displayed to the user by the filters), while Methods are required to check interaction with the filters, such as a selection of a certain filter by name.

##Scenarios
Scenarios describe how a user will interact with the application—for example, filling out a form, deleting an item, filtering, navigating, etc.
You might find it useful to define scenarios in a table:

Scenario | Description |  Checks------------ | --------------| ------Initialization |Should check that the page and all its components have been loaded and are visible| <ol><li>Load main container</li><li>Load filter list</li><li>Load three initial items</li></ul> |
Filtering | Should filter the items | <ol><li>Active filter is bold</li><li>URL has changed to the corresponding filter</li><li>The amount of filtered content</li></ol>

Scenarios only implement assertions on the page objects without diving into page internals.
For example:

```javascript
describe(‘Initialization’, function () {
  var page, filters;
  beforeEach(function () {
    page = new Page();
    page.load();
    filters = new Filters();
  });
  it(‘should check that filters are displayed’, function () {
    expect(filters.container.isDisplayed()).toBe(true);
  });
});
describe(‘Filtering’, function () {
  beforeEach(function () {
    ...
  });
  it(‘should select Item One filter’, function () {
    filters.select(‘Item One’);
    expect(filters.isSelected(‘Item One’)).toBe(true);
      ...
  });
});
```

In this way, any change to the underlying page structure affects only the page object, requiring minimal changes to your tests, which is exactly what we wanted to achieve.

##Conclusion
The page objects technique allows you to decouple your business interactions from the page implementation. If any changes are made to the page object, all the scenarios still work. It also allows you to perform regression tests. If you include a new feature, you just need to add/change the page object and write the corresponding scenario.

By setting a higher level of abstraction to your tests, you benefit from testing your code as it grows, without having to invest too many resources in maintaining the tests you’ve written.
