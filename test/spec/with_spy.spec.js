'use strict';

describeMixin('lib/with_spy', function () {
  var addedEventSpy,
      removedEventSpy,
      spiedEventSpy;
  var scrollDataMiss = {
    top: 0,
    left: 0,
    bottom: 100,
    right: 100
  };
  var scrollDataHit = {
    top: 150,
    left: 150,
    bottom: 200,
    right: 200
  };
  beforeEach(function () {
    setupComponent(readFixtures('scrollspy.html'));
    addedEventSpy = spyOnEvent(document, 'addedSpy');
    removedEventSpy = spyOnEvent(document, 'removedSpy');
    spiedEventSpy = spyOnEvent(document, 'uiSpied');
  });

  it('should register a new spy for a valid selector', function() {
    expect(this.component.addSpy('.target')).toBe(true);
    expect(addedEventSpy.callCount).toBe(1);
  });

  it('should not register a new spy for an invalid selector', function() {
    expect(this.component.addSpy('.invalid')).toBe(false);
    expect(addedEventSpy.callCount).toBe(0);
  });

  it('should be attachable to several targets at once', function() {
    this.component.addSpy('.target');
    this.component.addSpy('.inner');

    expect(addedEventSpy.callCount).toBe(2);
  });

  it('should trigger removed event when spy is removed', function() {
    this.component.addSpy('.target');
    this.component.removeSpy('.target');

    expect(addedEventSpy.callCount).toBe(1);
    expect(removedEventSpy.callCount).toBe(1);
  });

  it('should trigger on every uiScrolled and target is seen', function() {
    this.component.addSpy('.target');
    this.component.trigger('uiScrolled', scrollDataHit);
    this.component.trigger('uiScrolled', scrollDataHit);

    expect(spiedEventSpy.callCount).toBe(2);
    expect(spiedEventSpy.mostRecentCall.data).toEqual('.target');
  });

  it('should not trigger uiScrolled when no targets found', function() {
    this.component.addSpy('.target');
    this.component.trigger('uiScrolled', scrollDataMiss);

    expect(spiedEventSpy.callCount).toBe(0);
  });

  describe('multiple elements in view', function() {
    it('should trigger uiScrolled for both when both visible', function() {
      this.component.addSpy('.target');
      this.component.addSpy('.inner');

      this.component.trigger('uiScrolled', scrollDataHit);
      expect(spiedEventSpy.callCount).toBe(2);
    });

    it('should trigger uiScrolled for one when not all visible', function() {
      this.component.addSpy('.target');
      this.component.addSpy('.inner');
      this.component.addSpy('.impossible-target');

      this.component.trigger('uiScrolled', scrollDataMiss);
      expect(spiedEventSpy.callCount).toBe(1);
    });
  });

  describe('options', function() {
    describe('once', function() {
      it('should only trigger once when added', function() {
        expect(this.component.addSpy('.target', {once: true})).toBe(true);

        this.component.trigger('uiScrolled', scrollDataHit);
        this.component.trigger('uiScrolled', scrollDataHit);

        expect(spiedEventSpy.callCount).toBe(1);
        expect(removedEventSpy.callCount).toBe(1);
      });
    });

    describe('checkNow', function() {
      it('should trigger if elements are visible on add', function() {
        expect(this.component.addSpy('.at-the-top', {checkNow: true})).toBe(true);

        expect(spiedEventSpy.callCount).toBe(1);
      });

      it('should only trigger on the checkNow target', function() {
        this.component.addSpy('.at-the-top');
        this.component.addSpy('.inner', {checkNow: true});

        expect(spiedEventSpy.callCount).toBe(1);
        expect(spiedEventSpy.mostRecentCall.data).toEqual('.inner');
      });

      it('should not trigger when element not visible', function() {
        this.component.addSpy('.target', {checkNow: true});

        expect(spiedEventSpy.callCount).toBe(0);
      });
    });
  });

  describe('should refresh element offsets on window resize', function() {
    it('and do it successfully', function() {
      this.component.addSpy('.target');
      var eventSpy = spyOnEvent(document, 'spiesRefreshed');

      $(window).resize();

      expect(eventSpy.callCount).toBe(1);
      expect(eventSpy.mostRecentCall.data).toEqual({targets: ['.target']});
    });

    it('and honor once', function() {
      this.component.addSpy('.target', {once: true});
      var eventSpy = spyOnEvent(document, 'spiesRefreshed');

      $(window).resize();

      expect(eventSpy.callCount).toBe(1);
      expect(eventSpy.mostRecentCall.data).toEqual({targets: ['.target']});

      this.component.trigger('uiScrolled', scrollDataHit);
      expect(removedEventSpy.callCount).toBe(1);
    });

    it('and remove elements which has been removed from the page', function() {
      this.component.addSpy('.target');
      this.component.addSpy('.inner');
      this.component.$node.find('.target').remove();

      var eventSpy = spyOnEvent(document, 'spiesRefreshed');

      $(window).resize();

      expect(eventSpy.callCount).toBe(1);
      expect(removedEventSpy.callCount).toBe(1);
    });

    it('and not refresh if there is no elements to refresh', function() {
      var eventSpy = spyOnEvent(document, 'spiesRefreshed');

      $(window).resize();

      expect(eventSpy.callCount).toBe(0);
    });
  });
});
