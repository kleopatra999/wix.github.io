*Recycling previously allocated rows that went off-screen is a very popular optimization technique for list views implemented natively in iOS and Android. The default ListView implementation of React Native avoids this specific optimization in favor of other cool benefits, but this is still an awesome pattern worth exploring. Implementing this optimization under the “React state-of-mind” is also an interesting thought experiment.*

##Lists Are a Big Part of Mobile Development

Lists are the heart and soul of mobile apps. Many apps display lists — whether it’s the Facebook app with a list of posts in your feed, Messenger with lists of conversations, Gmail listing emails, Instagram listing photos, Twitter listing tweets...

As your lists become increasingly complex, with larger sources of data, thousands of rows, and rich memory-hungry media ,  they also become harder to implement.

On the one hand, you want to keep your app fast. Scrolling at 60 FPS has become the gold standard of native UX. On the other hand, you want to keep a low memory footprint—and mobile devices are not known for their abundance of resources. Winning both of these fronts is not always a simple task.

###Searching for the Perfect List View Implementation
It’s a common rule of thumb in software engineering that you can’t optimize in advance for every scenario. Let’s borrow from a different field—there is no single perfect database to hold your data. You’re probably familiar with [SQL databases](https://en.wikipedia.org/wiki/Relational_database) that excel in some use cases, and [NoSQL databases](v) that excel in others. Because it’s unlikely you would be implementing your own DB, as a software architect, you need to choose the right tool for the job.

The same rule holds for list views. You probably won’t find a single list view implementation that will win in every use case—keeping both FPS high and memory consumption low.

###Two Types of Lists
Roughly speaking, we can characterize two types of use cases for lists in mobile:

* Nearly identical rows with a very large data source. Every contact row probably looks the same and has the same structure. We want to let users browse through many rows quickly until they find what they’re looking for. Example: a contact directory.
* High variation between rows and a smaller data source. Every row here is different and includes a variable amount of text. Some hold media. Users will typically read messages progressively and not browse through the whole thread. Example: a chat conversation thread.

The benefit of splitting the world into different use cases is that we can offer different optimization techniques for each one.

###The Stock React Native List View
React Native comes bundled with an excellent stock ListView implementation. It employs some very clever optimizations, like lazily loading rows as the user scrolls to them, reducing the number of row re-renders to a minimum, and rendering rows in different event-loop cycles.

Another interesting property of the stock ListView is that it’s fully implemented in JavaScript over the [native ScrollView](https://github.com/facebook/react-native/blob/master/React/Views/RCTScrollView.h) component that ships with React Native. If you come to React Native from a native development background in iOS or Android, this fact probably strikes you as odd. At the foundation of their native SDKs are time-tested native list view implementations — [UITableView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableView_Class/) for iOS and [ListView](https://developer.android.com/reference/android/widget/ListView.html) for Android. It’s interesting that the React Native team decided not to rely on either of them.

There are probably many reasons why, but I would guess that it has to do with the use cases we’ve mentioned earlier. iOS UITableView and Android ListView use similar optimization techniques that perform very well under the first use case: nearly identical rows with a very large data source. The stock React Native ListView is simply optimized for the second.

The flagship of lists in the Facebook ecosystem is the Facebook feed. The Facebook app has been implemented natively in iOS and Android long before React Native. The initial implementation of the feed probably did rely on the native UITableView in iOS and ListView in Android, and as you can imagine, did not perform as well as expected. The feed is a classic example of the second use case. There is high variation between rows because each post is different, with varying amounts of content, types of media, and structure. Users read through the feed progressively, and they normally don’t browse through thousands of rows in a single sitting.

###Aren’t We Supposed to Talk About Recycling?
If the second use case applies to you—high variation between rows and a smaller data source — you should probably stick with the stock ListView implementation. If your use case falls under the first, and you’re unhappy with how the stock implementation performs, it might be a good idea to experiment with alternatives.

Reminder, the first use case is: <em>Nearly identical rows with a very large data source</em>. In this scenario, the main optimization technique that has proven to be useful is recycling rows.

Because our data source is potentially very large, we obviously can’t hold all the rows in memory at the same time. To keep memory consumption to a minimum, we would only hold in memory rows that are currently visible on screen. As the user scrolls, rows that are no longer visible will be freed, and new rows that become visible will be allocated.

However, it is very CPU-intensive to constantly free and allocate rows as the user scrolls. This naive approach will probably prevent us from reaching our 60 FPS target. Fortunately, under the current use case, the rows are nearly identical. This means that instead of freeing a row that went off-screen, we can repurpose it for a new row. We are simply going to replace the data it displays with data from the new row, thus avoiding new allocations altogether.

##Time to Get Our Fingers Dirty
Let’s set up a simple example to experiment with this use case. We will offer a sample of 3,000 rows of data similar in structure to the following:

<script src="https://gist.github.com/talkol/b2d9e1e3df9e00bd8aa3b64e51d3c21a.js"></script>

###UITableView as a Native Base
As previously mentioned, there are solid implementations that do row recycling in the native SDKs for iOS and Android. Let’s focus on iOS and use [UITableView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableView_Class/).

You might wonder why we aren’t attempting to implement this technique fully in JavaScript. This is an interesting topic that probably deserves a few separate blog posts to cover in-depth, but here’s a quick answer. In order to recycle rows properly, we must always be aware of the current scroll offset since rows must be recycled as soon as the user scrolls. Scroll events originate in the native realm, and in order to reduce the number of passes over the [RN bridge](http://tadeuzagallo.com/blog/react-native-bridge/), it makes sense to track them natively.

To [wrap a native component](https://facebook.github.io/react-native/docs/native-components-ios.html) like *UITableView* in React Native, we’ll need to create a simple manager class in Objective-C:

<script src="https://gist.github.com/talkol/e9a4cc854822fa5cfdfbb7a2e75ef36c.js"></script>

The actual wrapping will be done in RNTableView.m, and it will mostly revolve around passing the props forward and using them in the correct places. There’s no need to dive too deeply into the next implementation since it’s still missing the interesting parts.

<script src="https://gist.github.com/talkol/94e391cd240f2d492b0cad5a5b4fe541.js"></script>

###The Key Concept—Connecting Native and JS
We want our rows to be React components defined in JavaScript because that’s where our business logic lies, but  we also want to be able to customize them easily. Because the actual recycling logic is in native, we need to somehow “pass” these components from JS to native.

The best way to pass React components to our native component is as children. When we use our native component from JS by adding our rows in JSX as **children**, we’ll make React Native transform them to UIViews that will be provided to the native component.

The trick is that we don’t need to make components out of all the rows in the data source. We only need a small amount of rows to display on-screen since the entire point is to keep recycling them. Let’s estimate a maximum of 20 rows that will be displayed on-screen at the same time. One way to make this estimate is to divide the screen height (736 logical pixels in iPhone 6 Plus) by the height of every row ( 50 in our case), which amounts to about 15, and then add a few extra rows for good measure.

When these 20 rows are passed to our component as subviews on initialization, we won’t actually display them yet. We’ll just hold them in a bank of “unused cells”.

Now comes the interesting part. The native *UITableView* recycling works by trying to “*dequeueReusableCell*”. If a cell can be recycled (from a row off-screen), this method will return the recycled cell. If no cell can be recycled, our code needs to allocate a new one. Allocation of new cells only happens in the beginning until we fill the screen with visible rows. So how will we allocate a new cell? We’ll simply take one of the unused cells in our bank:

<script src="https://gist.github.com/talkol/c3d2a97a9edfd037ad1b520d0719649e.js"></script>

The last piece of the puzzle is to take the newly recycled/allocated cell and fill it with data from the data source. Since our rows are React components, let’s translate this process to React terminology: give the row component new props based on the correct row from the data source that we want to display.

Since changing props happens in the JS realm, we’ll need to actually do this in JavaScript. This means we’ll need to communicate back the fact that we’ve changed the binding of one of our rows. We can do this by dispatching an event from native to JS:

<script src="https://gist.github.com/talkol/ffe1086dd58711477bf5685e9e10232b.js"></script>

###Tying It All Together
Next, we’ll need to wrap our native component in JavaScript by finally implementing *RecyclingListView.js*:

<script src="https://gist.github.com/talkol/d9372caaad8a951106dadb4f9d108524.js"></script>

There’s one additional optimization we want to do. We want to minimize the number of re-renders. This means we only want to re-render a row after it has been recycled and re-bound.

That’s the purpose of *ReboundRenderer*. This simple JS component takes as props the data source row index that this component is currently bound to (the *boundTo* prop). It only re-renders itself if the binding changes (using the standard *shouldComponentUpdate* optimization):

<script src="https://gist.github.com/talkol/31ee848bbb034aa9fcfdaa18fbf985cf.js"></script>

##Seeing It All in Action
You can see a fully working example, which contains pretty much the same code we described above, in [this repo](https://github.com/wix/list-view-experiments).

The repo also contains a few other experiments that you might find interesting. The relevant experiment is [tableview-children.ios.js](https://github.com/wix/list-view-experiments/blob/master/tableview-children.ios.js).

Originally posted on &raquo; [Medium](https://medium.com/@talkol/recycling-rows-for-high-performance-react-native-list-views-628fd0363861#.o2xxfzyw7)