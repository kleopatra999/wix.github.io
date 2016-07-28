---
layout: post
title: Two Services and One Angular Factory - Case Study
date: 2015-08-18 16:54:09.000000000 +03:00
type: post
published: true
status: publish
categories:
- JavaScript
tags: []
meta:
  _edit_last: '34'
  _syntaxhighlighter_encoded: '1'
  _yoast_wpseo_focuskw: Angular Factory
  _yoast_wpseo_linkdex: '76'
  _yoast_wpseo_metadesc: Article about Using Angular Factory and implementing two
    services that use the same APIs but do things differently. Interesting Case Study
    about Angular Factory.
author:
  login: Dvir Cooper
  email: dvirc@wix.com
  display_name: Dvir Cooper
  first_name: Dvir
  last_name: Cooper
---
Running code in a client-side environment is tricky. Some APIs are available at runtime, but other APIs are not supported. Whether APIs are available depends on the browser, but also on the browser’s configuration, like if it’s in private mode or has a blocking tools extension installed. As front end developers, we need to develop web apps to work in any environment. This blog post is about that gray area and how we handled it by implementing two services that use the same APIs but do things differently.

When we started to develop our WixStores app—an eCommerce platform—we had to decide how we would share data between our components in the client browser. We chose local storage because when a user adds a product to the cart, the data is saved, and only when the user completes the transaction is the data cleared from the cart.

Initially, everything worked like a charm, but then we hit a snag. We needed our app to work when users blocked local storage, which made the localStorage APIs unavailable. There were many ways this could happen—for example, using Safari private mode, disabling cookies and site data in the browser settings, etc. We needed to implement a different way to share our data when localStorage APIs were not available, and we also needed to disable the data consistency—after all, the user asked for some privacy.

To workaround this issue, we decided that the best solution was to use an in-memory database. When localStorage APIs were available, we’d use LocalStorageService; however, when those APIs were missing, we’d use the in-memory service.

##Let’s meet the key players:

* LocalStorageService - Wraps the native localStorage API
* StorageService - Uses LocalStorageService to store the data
* DataService  - Does some manipulation on the data before sending it to StorageService

When we started implementing the solution, the first thing that came to mind was to add a public method to LocalStorageService that would check whether the localStorage API was available: 

```javascript
function isAvailable() {
   try {
     var testKey = '__wixstores__';
     this.setItem(testKey, testKey);
     if (this.getItem(testKey) !== testKey) {
        return false;
     }
     this.removeItem(testKey);
  } catch (e) {
     return false;
  }
  return true;
}
```

Happy with the new implementation, we turned to StorageService and started implementing the event base mechanism—until we realized it was repeating the same condition:

```javascript
   function saveData(data) {
        if (this.LocalStorageService.isAvailable()) {
           ...
        } else {
           …
        }
     }
     function getData(itemId) {
         if (this.LocalStorageService.isAvailable()) {
           ...
        } else {
           …
        }
     }
     function removeData(itemId) {
         if (this.LocalStorageService.isAvailable()) {
           ...
        } else {
           …
        }
     }
```

There must be a better way to write this code, right? Yes, there is. It’s called **Angular factory**.

##So what is Angular factory?
It’s a function with zero or more dependencies that returns the injectable value. We can use the factory to customize the service before returning it.

If we implement the service factory as we want, we can provide the right service to the right flow (with or without localStorage APIs). Angular also makes sure that the returned service is a singleton throughout our code by saving the reference of the generated service and providing it in case some other component will need its API or data. 
 
So instead of one StorageService, we implemented two services: 

* PersistentStorageService - The same implementation as before, just renamed
* InMemoryStorageService - Works with an in-memory array

They both have the same public methods and use the same unit tests. We registered the services in Angular as private services using ‘__’ (double underscore) annotation:

```javascript
function PersistentStorageService(localStorageService, dep2, dep3, ...) {
  function saveData(data) {
    ...
  }
 function getData(itemId) {
    ...
  }
}
function InMemoryStorageService(dep1, dep2, dep3, ...) {
  function saveData(data) {
     ….
  }
  function getData(itemId) {
    ...
  }
}
//private services
angular.module('WixStores').service('__persistentStorageService', PersistentStorageService);
angular.module('WixStores').service('__inMemoryStorageService', InMemoryStorageService);
```

So instead of writing the condition for each public method, the code returned the relevant service:

```javascript
function storageService(localStorageService, __persistentStorageService, __inMemoryStorageService) {
  if (localStorageService.isAvailable()) {
     return __persistentStorageService;
  } else {
     return __inMemoryStorageService;
  }
}
angular.module('WixStores').factory('storageService', storageService);
```

Once the factory gives the relevant service to DataService, it doesn’t matter which one it uses. The public methods are implemented by both services and everything is working like it should, even in an environment that has no local storage.

Factory - #ItsThatEasy

##P.S.
If you’re using some code in the constructor function of the service and don’t want the code to run when you inject the service, you can use $injector:

```javascript
function storageService(localStorageService, $injector) {
  if (localStorageService.isAvailable()) {
     return $injector.get('__persistentStorageService');
  } else {
     return $injector.get('__inMemoryStorageService');
  }
}
angular.module('WixStores').factory('storageService', storageService);
```
