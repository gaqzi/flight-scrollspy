define(function (require) {

  'use strict';

  var defineComponent = require('flight/lib/component'),
      utils = require('flight/lib/utils');

  return defineComponent(scrollSpy);

  /**
   * Whenever a scroll occurs on the target element trigger
   * `uiScrolled`, as long as it has bee `throttle` ms since last time
   * the event was triggered.
   *
   * Options:
   *   throttle: How long min between scroll events. Default: 100ms.
   *
   * @fires uiScrolled
   */
  function scrollSpy() {
    this.defaultAttrs({
      throttle: 100
    });

    this._triggerScroll = function() {
      var top = this.$node.scrollTop(),
          left = this.$node.scrollLeft();

      this.trigger('uiScrolled', {
        top: top,
        bottom: top + this.$node.height(),
        left: left,
        right: left + this.$node.width()
      });
    };

    this.after('initialize', function() {
      this.triggerScroll = utils.throttle(
        this._triggerScroll,
        this.attr.throttle
      );

      this.on('scroll', this.triggerScroll);
    });
  }

});
