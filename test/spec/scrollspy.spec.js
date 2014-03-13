'use strict';

describeComponent('lib/scrollspy', function () {

  // Initialize the component and attach it to the DOM
  beforeEach(function () {
    setupComponent(readFixtures('scrollspy.html'));
  });

  it('should trigger uiScrolled when the target element scrolls', function() {
    var eventSpy = spyOnEvent(document, 'uiScrolled');
    this.$node.scroll();

    expect(eventSpy.mostRecentCall.data).toEqual({
      top: 0,
      bottom: 100,
      left: 0,
      right: 100
    });
  });

  it('should only trigger uiScrolled once every "throttle" ms', function() {
    var eventSpy = spyOnEvent(document, 'uiScrolled');
    this.$node.scroll();
    this.$node.scroll();

    expect(eventSpy.callCount).toBe(1);
  });

});
