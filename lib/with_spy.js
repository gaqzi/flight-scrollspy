define(function() {
  'use strict';

  return withSpy;

  function withSpy() {
    var spyAttached = false,
        scrollEventName = 'uiScrolled',
        spiedEventName = 'uiSpied';

    /**
     * A spy is attached to a selector, whenever a scroll event occurs
     * and the selector is in view a 'uiSped' event will be triggered.
     *
     * You can only attach one spy at a time and if the selector
     * returns multiple hits the first match will be used. If you need
     * to refresh the position of the target for the selector just
     * addSpy again for the same selector and the old one will be
     * replaced with the new. Note: it will not remember options
     * between calls to addSpy.
     *
     * Valid options:
     * - once: will only trigger this event once.
     * - checkNow: if the element is in view at the moment of
     *             adding the spy then uiSpied is triggered directly.
     *
     * @fires addedSpy when successfully adding a spy
     * @fires uiSpied when a target element is in the viewport
     * @param {String} selector a jQuery selector
     * @param {Object} options
     * @returns {Boolean} wheter spy was added successfully or not.
     */
    this.addSpy = function(selector, options) {
      options = options || {};

      var el = this.$node.find(selector),
          offset = getElementOffset(el);

      if(offset) {
        this._addSpyTarget(selector, options, offset);
        this.trigger('addedSpy', {selector: selector});

        return true;
      }

      return false;
    };

    /**
     * Removes the selector from being spied upon.
     *
     * @param {String} selector a jQuery selector
     * @fires removedSpy
     */
    this.removeSpy = function(selector) {
      this._removeSpyTarget(selector);
      this.trigger('removedSpy', {selector: selector});
    };

    // This is silly, I'm declaring this on its own to silence jsHint
    var spyTargets = {
      selectors: {},
      handlers: 0,
      once: []
    };

    function getElementOffset(el) {
      var offset = el.offset();

      if(offset) {
        offset.bottom = offset.top + el.height();
        offset.right = offset.left + el.width();
      }

      return offset;
    }

    this._addSpyTarget = function(selector, options, offset) {
      if(spyTargets.selectors[selector] !== undefined) {
        this._removeSpyTarget(selector);
      }

      spyTargets.selectors[selector] = offset;
      spyTargets.handlers++;
      if(options.once) {
        spyTargets.once.push(selector);
      }
      if(options.checkNow && _checkNowIsVisible.call(this, selector)) {
        _triggerSpied.call(this, selector);
      }

      if(!spyAttached) {
        // Always collect the event at window, because it'll rarely be
        // available at the target $node.
        //
        // TODO: Should it be better checking that the event is the
        // correct one for this $node? Some kind of check that the
        // target is a sibling of this $node.
        this.on(window, scrollEventName, _spyHandler);
        this.on(window, 'resize', _onWindowResize);
        spyAttached = true;
      }
    };

    this._removeSpyTarget = function(selector) {
      delete spyTargets.selectors[selector];
      spyTargets.handlers--;
      var oncePos = spyTargets.once.indexOf(selector);
      if(oncePos > -1) {
        spyTargets.once.splice(oncePos, 1);
      }

      if(spyTargets.handlers <= 0 && spyAttached) {
        this.off(document, scrollEventName, _spyHandler);
        this.off(window, 'resize', _onWindowResize);
      }
    };

    function _triggerSpied(selector) {
      this.$node.find(selector).trigger(spiedEventName, selector);

      if(spyTargets.once.indexOf(selector) > -1) {
        this.removeSpy(selector);
      }
    }

    function _find(start, stop, min, max) {
      start = parseInt(start, 10);
      stop = parseInt(stop, 10);

      // top >= top of the browser window &&
      //   (top <= bottom of the browser window || bottom <= bottom)
      // ||
      // bottom >= top of the browser window &&
      //   (bottom <= bottom of the browser window || top <= bottom
      if((start >= min && (start <= max || stop <= max)) ||
         stop >= min && (stop <= max || start <= max)) {
        return true;
      }

      return false;
    }

    // Finds all selectors that is within the given the bounds for
    // the searchSpace (horizontal/vertical).
    function _findAll(searchSpace, min, max) {
      var l = spyTargets,
          all = [];

      for(var selector in l.selectors) {
        var target = l.selectors[selector];

        if(_find(target[searchSpace[0]], target[searchSpace[1]], min, max)) {
          all.push(selector);
        }
      }

      return all;
    }

    // Any elements that is to any extent visible in the viewport?
    function _spyHandler(e, data, onlySelector) {
      var top = _findAll(['top', 'bottom'], data.top, data.bottom),
          left = _findAll(['left', 'right'], data.left, data.right),
          triggered = [],
          max = top.length;

      if(!(top.length > 0 && left.length > 0)) {
        return;
      }

      for(var i=0;max > i;i++) {
        var selector = top[i];

        if(onlySelector && onlySelector !== selector) {
          continue;
        }

        if(triggered.indexOf(selector) === -1 &&
           left.indexOf(selector) !== -1) {
          triggered.push(selector);
          _triggerSpied.call(this, selector);
        }
      }
    }

    // This one is not as automatically tested as I would've
    // wanted. But I can't resize the window programatically.
    function _onWindowResize() {
      var refreshed = [];
      for(var selector in spyTargets.selectors) {
        var options = {};
        if(spyTargets.once.indexOf(selector) > -1) {
          options.once = true;
        }

        var el = this.$node.find(selector),
            offset = getElementOffset(el);

        if(offset) {
          this._addSpyTarget(selector, options, getElementOffset(el));
          refreshed.push(selector);
        } else {
          this.removeSpy(selector);
        }
      }

      if(refreshed.length > 0) {
        this.trigger('spiesRefreshed', {targets: refreshed});
      }
    }

    // To figure out if the selector is visible we need to know:
    // Is $node in the viewport? How much of $node is in the viewport?
    // Is `selector` visible at all within that portion of $node?
    function _checkNowIsVisible(selector) {
      var nodeOffset = getElementOffset(this.$node),
          $window = $(window),
          top = $window.scrollTop(),
          bottom = top + $window.height(),
          left = $window.scrollLeft(),
          right = $window.width();

      // The $node needs to be in the viewport
      if(_find(nodeOffset.top, nodeOffset.bottom, top, bottom) &&
         _find(nodeOffset.left, nodeOffset.right, left, right)) {

        // The selector needs to be visible inside the $node portion
        // visible in the viewport
        var visibleNodeHeight = bottom - nodeOffset.top,
            visibleNodeWidth = (right >= nodeOffset.right ?
                                nodeOffset.right : nodeOffset.right - right),
            selectorOffset = getElementOffset(this.$node.find(selector));

        if(_find(selectorOffset.top, selectorOffset.bottom, 0, visibleNodeHeight) &&
           _find(selectorOffset.left, selectorOffset.right, 0, visibleNodeWidth)) {
          return true;
        }
      }

      return false;
    }
  }
});
