import WidgetSvgNsMixin from "./widget-mixin-svgns";
import WidgetStateMixin from "./widget-mixin-state";
import WidgetOptionsMixin from "./widget-mixin-options";
import WidgetObserverMixin from "./widget-mixin-observer";

/**
 * Abstract base class representing an SVG widget that can be placed inside a DOM container.
 * Classes implementing this abstract class must implement the following:
 *  1) _initOptions(o)
 *  2) _initStateConstraints()
 *  3)
 *
 * @class
 * @abstract
 */
class Widget {

  /**
   * @constructor
   * @mixes WidgetSvgNsMixin
   * @mixes WidgetStateMixin
   * @mixes WidgetOptionsMixin
   * @mixes WidgetObserverMixin
   * @param {DOM element} container - DOM element that will contain the widget.
   * @param {object=} o - Options.
   */
  constructor(container, o) {
    if (container === undefined || !(container instanceof Element)) {
      throw new Error("widget requires a DOM element specifying its container as the first argument");
    }

    this.container = container;

    o = o || {};

    this.svg = document.createElementNS(this.SVG_NS, "svg");
    this.container.appendChild(this.svg);
    this.svg.setAttribute("width", this.container.getBoundingClientRect().width);
    this.svg.setAttribute("height", this.container.getBoundingClientRect().height);

    /* Manifest of containers and namespaces */
    this.o = {}                  // options namespace
    this.svgEls = {};            // svg element namespace
    this.handlers = {};          // mouse and touch event handler namespace
    this.state = {};             // state namespace
    this.stateConstraints = {};  // state constraints namespace
    this.observers = [];         // observer callback container

    this._initOptions(o);
    this._initStateConstraints();
    this._initState();
    this._initSvgEls();
    this._initHandlers();
  }

  /**
   * Initialize the options
   * @abstract
   * @protected
   */
  _initOptions(o) {
    throw new Error("Abstract method _initOptions(o) must be implemented by subclass");
  }

  /**
   * Initialize state constraints
   * @abstract
   * @protected
   */
  _initStateConstraints() {
    throw new Error("Abstract method _initState() must be implemented by subclass");
  }

  /**
   * Initialize state
   * @abstract
   * @protected
   */
  _initState() {
    throw new Error("Abstract method _initState() must be implemented by subclass");
  }

  /**
   * Initialize the svg elements.
   * Each implementation of this method must end with calls to _appendSvgEls() and _update(),
   * in that order, as shown in this template
   * @abstract
   * @protected
   */
  _initSvgEls() {
    throw new Error("Abstract method _initSvgEls() must be implemented by subclass");

    this._appendSvgEls();
    this._update();
  }

  /**
   * Append the newly created svg elements to the svg container.
   * This method should be called exctly once by each implementation of the _initSvgEls() method.
   * @protected
   */
  _appendSvgEls() {
    const _this = this;

    Object.values(_this.svgEls).forEach(svgEl => {
      appendSvgEls(svgEl);
    });

    function appendSvgEls(child) {
      if (child instanceof Array) {
        child.forEach(arrEl => appendSvgEls(arrEl));
      } else {
        _this.svg.appendChild(child);
        child.setAttribute("shape-rendering", "geometricPrecision");
      }
    }
  }

  /**
   * Initialize mouse and touch event handlers
   * @abstract
   * @protected
   */
  _initHandlers() {
    throw new Error("Abstract method _initHandlers() must be implemented by subclass");
  }

  /**
   * This method is called by _setState() right before _update().
   * The implementing class can make any final changes to the state that are
   * custom and specific to the implementing class before the _update() is rendered.
   * If no custom and specific changes are needed, the method should have an empty body.
   * @abstract
   * @protected
   */
  _finalizeState() {
    throw new Error("Abstract method _finalizeState() must be implemented by subclass");
  }

  /**
   * Get public representation of the state.
   * @abstract
   * @public
   */
  getPublicState() {
    throw new Error("Abstract method getPublicState() must be implemented by subclass");
  }

  /**
   * Update (redraw) component based on state
   * @abstract
   * @protected
   */
  _update() {
    throw new Error("Abstract method _update() must be implemented by subclass");
  }

   /** Helper method: get the width of the svg container */
   _getWidth() {
     return this.svg.getBoundingClientRect().width;
   }

   /** Helper method: get the height of the svg container */
   _getHeight() {
     return this.svg.getBoundingClientRect().height;
   }

   /** Helper method: get the top edge position of the svg container */
   _getTop() {
     return this.svg.getBoundingClientRect().top;
   }

   /** Helper method: get the left edge position of the svg container */
   _getLeft() {
     return this.svg.getBoundingClientRect().left;
   }
}

Object.assign(Widget.prototype, WidgetSvgNsMixin);
Object.assign(Widget.prototype, WidgetStateMixin);
Object.assign(Widget.prototype, WidgetOptionsMixin);
Object.assign(Widget.prototype, WidgetObserverMixin);

export default Widget