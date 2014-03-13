# flight-scrollspy

[![Build Status](https://travis-ci.org/gaqzi/flight-scrollspy.png)](http://travis-ci.org/gaqzi/flight-scrollspy)
[![Coverage Status](https://coveralls.io/repos/gaqzi/flight-scrollspy/badge.png)](https://coveralls.io/r/gaqzi/flight-scrollspy)

A [Flight](https://github.com/flightjs/flight) component for
triggering events when an element is scrolled into view.

This component was originally built to be able to handle infinity scroll.

## Installation

```bash
bower install --save flight-scrollspy
```

## Example

```js
define(function(require) {
    'use strict';

    var scrollSpy = require('flight-scrollspy/lib/scrollspy');

    return page;

    function page() {
        scrollSpy.attachTo('body', {
            throttle: 200 // ms, the default is 100ms.
        });
    }
});

define(function(require) {
    var defineComponent = require('flight/lib/component'),
        withSpy = require('flight-scrollspy/lib/with_spy');

    return defineComponent(infiniteScroll, withSpy);

    function infiniteScroll() {
        this.fetchMoreComments = function( { ... };

        this.after('initialize', function() {
            this.addSpy('.last-comment', {once: true})
            this.on('uiSpied', this.fetchMoreComments);

            // this.removeSpy('.last-comment');
        });
    }
});
```

## Events

* `uiScrolled` all the positions of the node element. Top, right, bottom and left
* `uiSpied` when a target element is seen within the viewport
* `addedSpy` when a new spy target is added
* `removedSpy` when a spy target is removed
* `spiesRefreshed` when the spies offsets has been updated after a window resize

## Development

Development of this component requires [Bower](http://bower.io) to be globally
installed:

```bash
npm install -g bower
```

Then install the Node.js and client-side dependencies by running the following
commands in the repo's root directory.

```bash
npm install & bower install
```

To continuously run the tests in Chrome during development, just run:

```bash
npm run watch-test
```

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

* [Bug reports](CONTRIBUTING.md#bugs)
* [Feature requests](CONTRIBUTING.md#features)
* [Pull requests](CONTRIBUTING.md#pull-requests)
