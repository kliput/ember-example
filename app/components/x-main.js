import Component from '@ember/component';
import ArraySlice from 'ember-example/utils/array-slice';
import { get, setProperties } from '@ember/object';
// import { scheduleOnce, throttle } from '@ember/runloop';
import _ from 'lodash';

// KEY_UP = 38;
// KEY_DOWN = 40;
// KEY_PAGE_DOWN = 34;
// KEY_PAGE_UP = 33;

export default Component.extend({
  classNames: ['x-main'],
  
  list: undefined,
  
  isSticky: undefined,
  
  scrollTop: 0,
  
  init() {
    this._super(...arguments);
    const array = _.range(1, 200).map(i => ({
      name: 'test-' + i,
    }));
    const list = ArraySlice.create({
      startIndex: 0,
      endIndex: 50,
      sourceArray: array,
    });
    this.set('list', list);
  },
  
  didInsertElement() {
    this.set('top', $('.main').offset().top);
    // $('.main').on('mousewheel.x-main', this.onMouseWheel.bind(this));
    // $('.main').on('keydown.x-main', this.onKeyPress.bind(this));
    $('.main').on('scroll', this.xScroll.bind(this));
    this.set('scrollTop', $('.main')[0].scrollTop);
  },
  
  willDestroyElement() {
    $('.main').off('.x-main');
  },
  
  /**
   * @param {Event} event 
   */
  xScroll(event) {
    const prev = this.get('scrollTop');
    const next = event.target.scrollTop;
    const scrollLength = next - prev;
    console.log('scrollLength: ' + scrollLength);
    if (this.get('isSticky')) {
      if (
        scrollLength < 0 ?
        !this.get('list.startReached') :
        !this.get('list.endReached')
      ) {
        event.target.scrollTop = prev;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (Math.abs(scrollLength) > Math.abs(this.get('scrollLength'))) {
          console.log('replacing scrollLength');
          this.set('scrollLength', scrollLength);
        }
        this.set('scrollLength', scrollLength);
        this.pseudoScroll();
        // throttle(this, 'pseudoScroll', 100);
      } else {
        this.set('scrollTop', event.target.scrollTop);
      }
    } else {
      this.set('scrollTop', event.target.scrollTop);
    }
  },
  
  pseudoScroll() {
    const scrollLength = this.get('scrollLength');
    if (scrollLength) {
      console.log('using scroll length: ' + scrollLength);
      this.set('scrollLength', 0);
      const positive = scrollLength > 0;
      const offset = Math[positive ? 'max' : 'min'](
        Math.floor(scrollLength / 5),
        positive ? 1 : -1
      );
      console.log('using offset: ' + offset);
      this._moveList(offset);
    }
  },
  
  _moveList(offset) {
    console.log('offset: ' + offset);
    const list = this.get('list');
    const startIndex = get(list, 'startIndex');
    const endIndex = get(list, 'endIndex');
    // const positive = offset > 0;
    // const realOffset = Math.min(Math.abs(offset), endIndex - startIndex) * positive ? 1 : -1;
    const realOffset = offset;
    console.log('real offset: ' + realOffset);
    setProperties(list, {
      startIndex: startIndex + realOffset,
      endIndex: endIndex + realOffset,
    });
    console.log('move', startIndex, endIndex);
  },
  
  /**
   * @param {Event} event 
   */
  onKeyPress(event) {
    if (this.get('isSticky')) {
      let scrollUp;
      if (event.key === 'ArrowUp') {
        scrollUp = true;
      } else if (event.key === 'ArrowDown') {
        scrollUp = false;
      }
      if (scrollUp !== undefined) {
        this.pseudoScroll();
      }
    }
  },
  
  /**
   * 
   * @param {WheelEvent} event 
   */
  onMouseWheel(event) {
    // TODO: allow scroll up if is sticky now and first element on list
    if (this.get('isSticky')) {
      const scrollUp = event.originalEvent.wheelDelta >= 0;
      this.pseudoScroll(scrollUp);
    }
  },
  
  actions: {
    setSticky(sticky) {
      this.set('isSticky', sticky);
    },
  },
});
