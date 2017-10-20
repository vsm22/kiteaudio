/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Constraint object represents constraints on a value.
 * Instances of Constraint are used as leaves on a ConstraintSpec definition.
 * A ConstraintSpec useses Constraints to apply a constraint to leaves of an
 * arbitrarily nested object, whose leaves represent values that may be constrained.
 *
 * @class
 */
class Constraint {

  /**
   * @constructor
   * @param {object=} spec - Spec specifying the constraints.
   * @param {number=} spec.min - Minimum value.
   * @param {number=} spec.max - Maximum value.
   * @param {array=} spec.enum - Array of possible enumerable values.
   * @param {function=} spec.transform - A transformation function to apply to the value.
   */
  constructor(spec) {
    spec = spec || {};

    this.min = spec.min;
    this.max = spec.max;
    this.enum = spec.enum;
    this.transform = spec.transform;
  }
}

/* harmony default export */ __webpack_exports__["a"] = Constraint;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constraint__ = __webpack_require__(0);


/**
 * ConstraintSpec is used to apply a constraining function to a state object of arbitrary nestedness,
 * whose leaves are values that need to be constrained (i.e. to min or max values).
 * In order for ConstraintSpec to work properly, it's constructor must be given an object that
 * exactly mirrors the nested structure of the object to be constrained, with the leaves
 * containing instances of the Constraint class. Additional requirements (i.e. how to deal with nested arrays)
 * are outlined below.
 * TODO: expand explanation
 *
 * @class
 */
class ConstraintSpec {

  /**
   * @constructor
   * @param {object} specDefObj - The constraint spec definition object, which defines the nesting
   *                              structure of the objects that need to be constrained. The leaves
   *                              of this specDef object must be objects of type Constraint, which
   *                              act as the constraint definitions for each leaf.
   */
  constructor(specDefObj) {
    this.constraintMap = [[]];
    this._parseMap(specDefObj, this.constraintMap[0], this.constraintMap);
  }

  /**
   * Check a constraint map for constraint specs and apply them to obj.
   * Note: will not mutate the original object. New value is returned.
   * @public
   * @param {object} targetObj - The state object to check
   * @return {number | string | object | array} val - The constrained value.
   */
  constrain(targetObj) {
    const _this = this;
    _this.constraintMap.forEach(keyBranch => {
      _this._constrainBranch(targetObj, keyBranch);
    });
  }

  /**
   * Apply a constraint.
   * @private
   * @param {object} target - The target object to constrain
   * @param {Constraint} constraint - The constraint object to use.
   * @param {symbol} key - The key to use to access the constraint.
   * @return {number | string | object | array} val - The constrained value.
   */
  _applyConstraint(target, constraint, key) {
    if (constraint.min !== undefined) {
      target[key] = Math.max(target[key], constraint.min);
    }
    if (constraint.max !== undefined) {
      target[key] = Math.min(target[key], constraint.max);
    }
    if (constraint.enum !== undefined && constraint.enum instanceof Array) {
      target[key] = (constraint.enum.find(target[key]) !== undefined) ? target[key] : constraint.enum[0];
    }
    if (constraint.transform !== undefined && typeof constraint.transform === "function") {
      target[key] = constraint.transform(target[key]);
    }

    return target;
  }

  /**
   * Parse a constraint map
   * @private
   * @param {object} c - The map object currently being examined.
   *                     At the top level, this would be the whole map.
   *                     At the terminal level, this would be an instance of Constraint object.
   * @param {array} keyBranch - An array of keys that will specify how to get to each Constraint.
   *                            The last element in this array will be the constraint itself.
   * @param {array} cMap - An mutable array of key branches.
   */
  _parseMap(c, keyBranch, cMap) {
    const _this = this;

    if (c instanceof Array) {
      /* if c is an array, add "_arr_" to the current map, and examine the first element.
       * all elements in an array are required to have identical structure, so examining
       * the first one is enough.
       */
      keyBranch.push("_arr_");
      _this._parseMap(c[0], keyBranch, cMap);
    } else if (c instanceof Object && !(c instanceof __WEBPACK_IMPORTED_MODULE_0__constraint__["a" /* default */])) {
      // keep a copy of the parent branch to create new branches from
      let parentBranch = keyBranch.map(x=>x);

      // create new branch for each key after the first key using the parentBranch clone
      Object.keys(c).forEach((key, keyIdx) => {
        if (keyIdx === 0) {
          keyBranch.push(key);
          _this._parseMap(c[key], keyBranch, cMap)
        } else {
          let newKeyBranch = parentBranch.map(x=>x);
          cMap.push(newKeyBranch);
          newKeyBranch.push(key);
          _this._parseMap(c[key], newKeyBranch, cMap);
        }
      });
    } else if (c instanceof __WEBPACK_IMPORTED_MODULE_0__constraint__["a" /* default */]) {

      // this will be the last element in the branch - the Constraint object itself
      keyBranch.push(c);
    }
  }

  /**
   * Apply constraints to one branch of the constraint map.
   * @private
   * @param {object} targetObj - The state object to apply the constraint to
   * @param {object} defObj - The constraint definition object to use.
   * @param {array} keyBranch - An array of keys representing a path to a constraint object.
   */
  _constrainBranch(targetObj, keyBranch) {
    const _this = this;

    let curKey;
    let constraint = keyBranch[keyBranch.length - 1];
    let arrFlag = false;

    /* Drill into targetObj and defObj following keyBranch keys
     * We go to length - 2, because the next-to-last element might be an
     * array, and the last element is the Constraint object itself.
     */
    for (let i = 0; i < keyBranch.length - 2 && !arrFlag; ++i) {
      curKey = keyBranch[i];

      // if we encounter an array, drill into each corresponding arry element in targetObj
      if (curKey === "_arr_") {
        arrFlag = true;

        let keyBranchSlice = keyBranch.slice(i + 1, keyBranch.length);

        for (let j = 0; j < targetObj.length; ++j) {
          _this._constrainBranch(targetObj[j], keyBranchSlice);
        }
      } else {
        targetObj = targetObj[curKey];
      }
    }

    // if arrFlag is set, we've encountered an array somewhere other than on the leaves
    // in this case we don't need to operate on it
    if (!arrFlag) {
      // Apply the constraints
      curKey = keyBranch[keyBranch.length - 2];

      if (curKey === "_arr_") {
        for (let i = 0; i < targetObj.length; ++i) {
          _this._applyConstraint(targetObj, constraint, i);
        }
      } else {
        _this._applyConstraint(targetObj, constraint, curKey);
      }
    }
  }
}

/* harmony default export */ __webpack_exports__["a"] = ConstraintSpec;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_mixin_svgns__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_mixin_state__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__widget_mixin_options__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__widget_mixin_observer__ = __webpack_require__(6);





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

Object.assign(Widget.prototype, __WEBPACK_IMPORTED_MODULE_0__widget_mixin_svgns__["a" /* default */]);
Object.assign(Widget.prototype, __WEBPACK_IMPORTED_MODULE_1__widget_mixin_state__["a" /* default */]);
Object.assign(Widget.prototype, __WEBPACK_IMPORTED_MODULE_2__widget_mixin_options__["a" /* default */]);
Object.assign(Widget.prototype, __WEBPACK_IMPORTED_MODULE_3__widget_mixin_observer__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = Widget;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__constraint__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__constraint_spec__ = __webpack_require__(1);




/**
 * Class representing an SVG Dial widget
 *
 * @class
 * @implements {Widget}
 */
class WidgetDial extends __WEBPACK_IMPORTED_MODULE_0__widget__["a" /* default */] {

  /**
   * @constructor
   * @param {object} container - DOM container for the widget.
   * @param {object=} o - options.
   * @param {number=0} o.minVal - Minimum value constraint.
   * @param {number=127} o.maxVal - Maximum value constraint.
   * @param {string="#000"} o.needleColor - Dial needle color.
   * @param {string="#f40"} o.activeColor - Dial active color.
   */
  constructor(container, o) {
    super(container, o);
  }

  /**
   * Initialize the options
   * @override
   * @protected
   */
  _initOptions(o) {
    // set the defaults
    this.o = {
      minVal: 0,
      maxVal: 127,
      needleColor: "#414141",
      activeColor: "#f40",
      mouseSensitivity: 1.2
    };

    // override defaults with provided options
    this.setOptions(o);
  }

  /**
   * Initialize state constraints
   * @override
   * @protected
   */
  _initStateConstraints() {
    const _this = this;

    this.stateConstraints = new __WEBPACK_IMPORTED_MODULE_2__constraint_spec__["a" /* default */]({
      val: new __WEBPACK_IMPORTED_MODULE_1__constraint__["a" /* default */]({
        min: _this.o.minVal,
        max: _this.o.maxVal,
        transform: num => ~~num
      })
    });
  }

  /**
   * Initialize state
   * @override
   * @protected
   */
  _initState() {
    this.state = {
      val: 0
    };
  }

  /**
   * Initialize the svg elements
   * @override
   * @protected
   */
  _initSvgEls() {
    const _this = this;

    this.svgEls = {
      bgArc: document.createElementNS(this.SVG_NS, "path"),
      activeArc: document.createElementNS(this.SVG_NS, "path"),
      needle: document.createElementNS(this.SVG_NS, "line")
    };

    // draw the background arc
    this.svgEls.bgArc.setAttribute("d",
      _this._calcSvgArcPath(
        _this._calcNeedleCenter().x,
        _this._calcNeedleCenter().y,
        _this._calcDialRadius(),
        0.67 * Math.PI,
        2.35 * Math.PI
    ));
    this.svgEls.bgArc.setAttribute("stroke-width", _this._calcArcStrokeWidth());
    this.svgEls.bgArc.setAttribute("stroke", _this.o.needleColor);
    this.svgEls.bgArc.setAttribute("fill", "transparent");
    this.svgEls.bgArc.setAttribute("stroke-linecap", "round");

    // draw the active arc
    this.svgEls.activeArc.setAttribute("stroke-width", _this._calcArcStrokeWidth());
    this.svgEls.activeArc.setAttribute("stroke", _this.o.activeColor);
    this.svgEls.activeArc.setAttribute("fill", "transparent");
    this.svgEls.activeArc.setAttribute("stroke-linecap", "round");

    // draw the needle
    this.svgEls.needle.setAttribute("x1", _this._calcNeedleCenter().x);
    this.svgEls.needle.setAttribute("y1", _this._calcNeedleCenter().y);
    this.svgEls.needle.setAttribute("x2", _this._calcNeedleEnd().x);
    this.svgEls.needle.setAttribute("y2", _this._calcNeedleEnd().y);
    this.svgEls.needle.setAttribute("stroke-width", _this._calcNeedleWidth());
    this.svgEls.needle.setAttribute("stroke", _this.o.needleColor);
    this.svgEls.needle.setAttribute("z-index", "1000");
    this.svgEls.needle.setAttribute("stroke-linecap", "round");

    this._appendSvgEls();
    this._update();
  }

  /**
   * Initialize mouse and touch event handlers
   * @override
   * @protected
   */
   _initHandlers() {
      const _this = this;

      let y0 = 0;
      let yD = 0;
      let newVal = _this.getState().val;

      this.handlers = {
       touch: function(ev) {
         y0 = ev.clientY;

         document.addEventListener("mousemove", _this.handlers.move);
         document.addEventListener("touchmove", _this.handlers.move);
         document.addEventListener("mouseup", _this.handlers.release);
         document.addEventListener("touchend", _this.handlers.release);
       },
       move: function(ev) {
         ev.preventDefault();

         yD = y0 - ev.clientY;
         y0 = ev.clientY;

         newVal = _this.state.val + (yD * _this.o.mouseSensitivity);
         newVal = Math.max(newVal, _this.o.minVal);
         newVal = Math.min(newVal, _this.o.maxVal);

         _this._setState({
           val: newVal
         })
       },
       release: function() {
         document.removeEventListener("mousemove", _this.handlers.move);
         document.removeEventListener("touchmove", _this.handlers.move);
       }
      };

      this.svg.addEventListener("mousedown", _this.handlers.touch);
      this.svg.addEventListener("touchstart", _this.handlers.touch);
   }

   // This method left blank here as there is nothing to finalize
   _finalizeState() {}

    /**
     * Update (redraw) component based on state
     * @override
     * @protected
     */
   _update() {
     // change the needle angle
     this.svgEls.needle.setAttribute("x1", this._calcNeedleCenter().x);
     this.svgEls.needle.setAttribute("y1", this._calcNeedleCenter().y);
     this.svgEls.needle.setAttribute("x2", this._calcNeedleEnd().x);
     this.svgEls.needle.setAttribute("y2", this._calcNeedleEnd().y);

     // change the active arc length
     this.svgEls.activeArc.setAttribute("d",
       this._calcSvgArcPath(
         this._calcNeedleCenter().x,
         this._calcNeedleCenter().y,
         this._calcDialRadius(),
         0.65 * Math.PI,
         this._calcNeedleAngle() - 0.5 * Math.PI
     ));

     // if the value is at min, change the color to match needle color
     // - otherwise the active part will be visible beneath the needle
     if (this.state.val === this.o.minVal) {
       this.svgEls.activeArc.setAttribute("stroke", this.o.needleColor);
     } else {
       this.svgEls.activeArc.setAttribute("stroke", this.o.activeColor);
     }
   }

   /**
    * Get public state
    */
  getPublicState() {
    return this.state.val;
  }

  /* ==============
   * Helper Methods
   * ==============
   */

   /** Calculte the stroke width for the background and active arcs */
   _calcArcStrokeWidth() {
     return this._calcDialRadius() / 5;
   }

   /** Calculate the dial radius */
   _calcDialRadius() {
     let radius = (Math.min(this._getWidth(), this._getHeight()) / 2) * 0.89;
     radius = Math.trunc(radius);
     return radius;
   }

   /** Calculate the needle angle for a given state val */
   _calcNeedleAngle() {
     const _this = this;

     return (
              // protect against divide by 0:
              (this.o.maxVal - _this.o.minVal) !== 0
                ?
                    (_this.state.val - _this.o.minVal) / (_this.o.maxVal - _this.o.minVal)
                  * (1.7 * Math.PI)
                  + (1.15 * Math.PI)
                :
                  0.5 * (1.7 * Math.PI) + (1.15 * Math.PI)
            );
   }

   /** Calculate the center of the needle, return {x, y} */
   _calcNeedleCenter() {
     const _this = this;
     return {
       x: Math.trunc(_this._getWidth() / 2),
       y: Math.trunc(_this._getHeight() / 2)
     };
   }

   /** Calculate position of end of the needle, return {x, y} */
   _calcNeedleEnd() {
     const _this = this;
     return {
       x: _this._calcNeedleCenter().x + (Math.sin(_this._calcNeedleAngle()) * _this._calcDialRadius()),
       y: _this._calcNeedleCenter().y - (Math.cos(_this._calcNeedleAngle()) * _this._calcDialRadius())
     }
   }

   /** Calculate the needle width */
   _calcNeedleWidth() {
     return this._calcDialRadius() / 5;
   }

   /** Calculate the path for an svg arc based on cx, cy, r, startAngle, endAngle */
   _calcSvgArcPath(cx, cy, r, startAngle, endAngle) {
     let x1 = cx + (r * Math.cos(startAngle));
     let y1 = cy + (r * Math.sin(startAngle));
     let x2 = cx + (r * Math.cos(endAngle));
     let y2 = cy + (r * Math.sin(endAngle));
     let largeArc = (endAngle - startAngle) < Math.PI ? 0 : 1;
     let sweep = (endAngle - startAngle) < Math.PI ? 1 : 1;

     return ["M", x1, y1, "A", r, r, 0, largeArc, sweep, x2, y2].join(" ");
   }
}

/* harmony default export */ __webpack_exports__["a"] = WidgetDial;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__constraint__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__constraint_spec__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_math__ = __webpack_require__(5);





/**
 * Class representing an Envelope Graph widget
 *
 * @class
 * @implements {Widget}
 */
class WidgetEnvelopeGraph extends __WEBPACK_IMPORTED_MODULE_0__widget__["a" /* default */] {

  /**
   * @constructor
   * @param {object} container - DOM container for the widget.
   * @param {object=} o - Options.
   * @param {number=0} o.minXVal - Minimum X value.
   * @param {number=0} o.minYVal - Minimum Y value.
   * @param {number=100} o.maxXVal - Maximum X value.
   * @param {number=100} o.maxYVal - Maximum Y value.
   * @param {number=-1} o.maxNumVertices - Maximum number of vertices.
   * @param {number=0.1} o.quantizeX - X-quantization ("grid") value.
   * @param {number=0.1} o.quantizeY - Y-quantization ("grid") value.
   * @param {number=1} o.xDecimalPrecision - Number of decimal places for output of the X values.
   * @param {number=1} o.yDecimalPrecision - Number of decimal places for output of the Y values.
   * @param {boolean=false} o.hasFixedStartPoint - Is there a fixed start vertex?
   * @param {boolean=false} o.hasFixedEndPoint - Is there a fixed end vertex?
   * @param {number=0} o.fixedStartPointY - Y value of the fixed start vertex, if exists.
   * @param {number=0} o.fixedEndPointY - Y value of the fixed end vertex, if exists.
   * @param {boolean=true} o.isEditable - Is the graph editable?
   * @param {string="#000"} o.vertexColor - Color of vertex points.
   * @param {string="#000"} o.lineColor - Color of lines connecting the vertices.
   * @param {string="#fff"} o.bgColor - Background color.
   * @param {number=2} o.lineWidth - Width of the connecting lines.
   * @param {number=4} o.vertexRadius - Radius of the vertex points.
   * @param {number=1.2} o.mouseSensitivity - Mouse sensitivity (how much moving the mouse affects the interaction).
   */
  constructor(container, o) {
    super(container, o);
  }

  /**
   * Initialize the options
   * @override
   * @protected
   */
  _initOptions(o) {
    // set defaults
    this.o = {
      minXVal: 0,
      minYVal: 0,
      maxXVal: 100,
      maxYVal: 100,
      maxNumVertices: -1,
      quantizeX: 0.1,
      quantizeY: 0.1,
      xDecimalPrecision: 1,
      yDecimalPrecision: 1,
      hasFixedStartPoint: false,
      hasFixedEndPoint: false,
      fixedStartPointY: 0,
      fixedEndPointY: 0,
      isEditable: true,
      vertexColor: "#f40",
      lineColor: "#484848",
      bgColor: "#fff",
      vertexRadius: 4,
      lineWidth: 2,
      mouseSensitivity: 1.2
    };

    // override defaults with provided options
    this.setOptions(o);
  }

  /**
   * Initialize state constraints
   * @override
   * @protected
   */
  _initStateConstraints() {
    const _this = this;

    this.stateConstraints = new __WEBPACK_IMPORTED_MODULE_2__constraint_spec__["a" /* default */]({
      vertices: [{
        x: new __WEBPACK_IMPORTED_MODULE_1__constraint__["a" /* default */]({
          min: _this.o.minXVal,
          max: _this.o.maxXVal,
          transform: (num) => {
            return __WEBPACK_IMPORTED_MODULE_3__util_math__["a" /* default */].quantize(num, _this.o.quantizeX)
              .toFixed(_this.o.xDecimalPrecision);
          }
        }),
        y: new __WEBPACK_IMPORTED_MODULE_1__constraint__["a" /* default */]({
          min: _this.o.minYVal,
          max: _this.o.maxYVal,
          transform: (num) => {
            return __WEBPACK_IMPORTED_MODULE_3__util_math__["a" /* default */].quantize(num, _this.o.quantizeY)
              .toFixed(_this.o.yDecimalPrecision);
          }
        })
      }]
    });
  }

  /**
   * Initialize state
   * @override
   * @protected
   */
  _initState() {
    this.state = {
      // verices contains an array of vertices
      // each vertex is an object of form {x, y}
      vertices: []
    };
  }

  /**
   * Initialize the svg elements
   * @override
   * @protected
   */
  _initSvgEls() {
    const _this = this;

    this.svgEls = {
      panel: document.createElementNS(this.SVG_NS, "rect"),
      vertices: [],
      lines: []
    };

    this.svgEls.panel.setAttribute("width", this._getWidth());
    this.svgEls.panel.setAttribute("height", this._getHeight());
    this.svgEls.panel.setAttribute("fill", this.o.bgColor);
    this.svgEls.panel.setAttribute("stroke", this.o.lineColor);

    this._appendSvgEls();
    this._update();
  }

  /**
   * Initialize mouse and touch event handlers
   * @override
   * @protected
   */
  _initHandlers() {
    const _this = this;

    let targetVtx = null;

    this.handlers = {
       touchPanel: function touchPanel(ev) {
         let xPos = ev.clientX - _this._getLeft();
         let yPos = ev.clientY - _this._getTop()
         let vertexState = _this._calcVertexState({x: xPos, y: yPos});

         _this.addVertex(vertexState);

         _this.svgEls.vertices.forEach(vtx => {
           vtx.addEventListener("mousedown", _this.handlers.touchVertex);
           vtx.addEventListener("touchdown", _this.handlers.touchVertex);
         });
       },
       touchVertex: function touchVertex(ev) {
         targetVtx = ev.target;

         document.addEventListener("mousemove", _this.handlers.moveVertex);
         document.addEventListener("touchmove", _this.handlers.moveVertex);
         ev.target.addEventListener("mouseup", _this.handlers.deleteVertex);
         ev.target.addEventListener("touchend", _this.handlers.deleteVertex);
       },

       /* handler for deleting a vertex */
       deleteVertex: function deleteVertex(ev) {
         // remove move handlers so that the point is not moved when it is being deleted
         document.removeEventListener("mousemove", _this.handlers.moveVertex);
         document.removeEventListener("touchmove", _this.handlers.moveVertex);

         // delete the point
         _this._deleteVertex(ev.target);

         // remove the delete handlers
         ev.target.removeEventListener("mouseup", _this.handlers.deleteVertex);
         ev.target.removeEventListener("touchend", _this.handlers.deleteVertex);
       },

       /* handler for moving a vertex */
       moveVertex: function moveVertex(ev) {
         // remove delete handlers so that point is not deleted when mouse is up
         targetVtx.removeEventListener("mouseup", _this.handlers.deleteVertex);
         targetVtx.removeEventListener("touchend", _this.handlers.deleteVertex);

         // add listeners to stop moving the vertex when mouse or touch is up
         document.addEventListener("mouseup", _this.handlers.endMoveVertex);
         document.addEventListener("touchend", _this.handlers.endMoveVertex);

         let xPos = ev.clientX - _this._getLeft();
         let yPos = ev.clientY - _this._getTop();

         _this._moveVertex(targetVtx, {x: xPos, y: yPos});
       },

       /* handler for ending moving a vertex */
       endMoveVertex: function endMoveVertex(ev) {
         // remove handlers
         document.removeEventListener("mousemove", _this.handlers.moveVertex);
         document.removeEventListener("touchmove", _this.handlers.moveVertex);
       }
    };

    this.svgEls.panel.addEventListener("mousedown", _this.handlers.touchPanel);
    this.svgEls.panel.addEventListener("touchdown", _this.handlers.touchPanel);

    this.svgEls.vertices.forEach(vtx => {
      vtx.addEventListener("mousedown", _this.handlers.touchVertex);
      vtx.addEventListener("touchdown", _this.handlers.touchVertex);
    });
  }

  /**
   * Finalize the state before _update().
   * Sort the vertices and make sure correct values are used if o.hasFixedStartPoint or
   * o.hasFixedEndPoint flags are used.
   */
   //TODO: is this method really needed? Can do the work of this method inside _update();
  _finalizeState() {
  }

  /**
   * Update (redraw) component based on state
   * @override
   * @protected
   */
  _update() {
      const _this = this;

      // if there are more state vertices than svg vertices, add a corresponding number of svg vertices and lines
      for (let i = _this.svgEls.vertices.length; i < _this.state.vertices.length; ++i) {
        _this._addSvgVertex();
      }

      // if there are more svg vertices than state vertices, remove a corresponding number of svg vertices and lines
      for (let i = _this.svgEls.vertices.length; i > _this.state.vertices.length; --i) {
        _this._removeSvgVertex();
      }

      // sort svg vertexes
      let idxSortMap = _this.state.vertices.map((vtx, idx) => { return { vtx: vtx, idx: idx }});
      idxSortMap.sort((a, b) => a.vtx.x - b.vtx.x);
      _this.state.vertices = idxSortMap.map(el => _this.state.vertices[el.idx]);
      _this.svgEls.vertices = idxSortMap.map(el => _this.svgEls.vertices[el.idx]);

      // set the correct position coordinates for every vertex
      _this.state.vertices.forEach((stateVtx, idx) => {
        let svgVtx = _this.svgEls.vertices[idx];
        let pos = _this._calcVertexPos(stateVtx);

        svgVtx.setAttribute("cx", pos.x);
        svgVtx.setAttribute("cy", pos.y);
        svgVtx.setAttribute("r", _this.o.vertexRadius);
        svgVtx.setAttribute("fill", _this.o.vertexColor);

        // for every vertex other than the first, draw a line to the previous vertex
        if (idx > 0) {
          let prevVtx = _this.state.vertices[idx - 1];
          let prevPos = _this._calcVertexPos(prevVtx);
          let line = _this.svgEls.lines[idx - 1];

          line.setAttribute("d", "M " + pos.x + " " + pos.y + " L " + prevPos.x + " " + prevPos.y);
          line.setAttribute("fill", "transparent");
          line.setAttribute("stroke-width", _this.o.lineWidth);
          line.setAttribute("stroke", _this.o.lineColor)
        }
      });

      // remove and reappend all svg elements so that vertices are on top of lines
      _this.svgEls.lines.forEach(svgLine => {
        _this.svg.removeChild(svgLine);
        _this.svg.appendChild(svgLine);
      });

      _this.svgEls.vertices.forEach(svgVtx => {
        _this.svg.removeChild(svgVtx);
        _this.svg.appendChild(svgVtx);
      });
   }

   /**
    * Return the state.
    * @override
    */
   getPublicState() {
     return this.state.vertices.map(vtx => [vtx.x, vtx.y]);
   }

  /* ==============
   * Helper Methods
   * ==============
   */

   /** Calculate the x and y for a vertex in the graph according to its state value */
   _calcVertexPos(vertexState) {
     return {
       x: this._getWidth() * (vertexState.x / this.o.maxXVal),
       y: this._getHeight() - (this._getHeight() * (vertexState.y / this.o.maxYVal))
     }
   }

   /** Calculate the x and y for a vertex state based on position on the graph
    *  (inverse of _calcVertexPos)
    */
  _calcVertexState(vertexPos) {
    return {
      x: this.o.maxXVal * (vertexPos.x / this._getWidth()),
      y: this.o.maxYVal - (this.o.maxYVal * (vertexPos.y / this._getHeight()))
    }
  }

   /**
    * Add a new vertex to the state
    * @public
    * @param {object} pos
    * @param {number} pos.x
    * @param {number} pos.y
    */
   addVertex(pos) {
     let newVertices = this.getState().vertices.map(x=>x);

     newVertices.push({x: pos.x, y: pos.y});
     newVertices.sort((a, b) => a.x - b.x);

     this._setState({
       vertices: newVertices
     });
   }

   /**
    * Delete a vertex
    * @private
    * @param {SVGElement} targetVtx - Vertex to Delete
    */
   _deleteVertex(targetVtx) {
     const _this = this;
     let vtxIdx = this.svgEls.vertices.findIndex(vtx => vtx === targetVtx);

     if (vtxIdx !== -1) {
       let newVertices = this.getState().vertices.map(x=>x);
       newVertices.splice(vtxIdx, 1);
       _this._setState({
         vertices: newVertices
       });
     }
   }

   /**
    * Move a vertex
    * @private
    * @param {SVGElement} targetVtx - The target vertex
    * @param {Object} newPos - The new position
    * @param {number} newPos.x
    * @param {number} newPos.y
    */
   _moveVertex(targetVtx, newPos) {
     const _this = this;

     let vtxState = _this._calcVertexState(newPos);
     let vtxIdx = _this.svgEls.vertices.findIndex(vtx => vtx === targetVtx);
     let vertices = _this.getState().vertices.map(x=>x);

     vertices[vtxIdx].x = vtxState.x;
     vertices[vtxIdx].y = vtxState.y;

     _this._setState({
       vertices: vertices
     });
   }

   /** Add a new SVG vertex representation */
   _addSvgVertex() {
     const _this = this;

     // if there is more than 1 vertex, we also need to draw lines between them
     if (_this.getState().vertices.length > 1) {
       let newLine = document.createElementNS(_this.SVG_NS, "path");
        _this.svg.appendChild(newLine);
        _this.svgEls.lines.push(newLine);
     }

     let newVertex = document.createElementNS(_this.SVG_NS, "circle");
     _this.svgEls.vertices.push(newVertex);
     _this.svg.appendChild(newVertex);
   }

   /** Remove an SVG vertex */
   _removeSvgVertex() {
     let vertex = this.svgEls.vertices[this.svgEls.vertices.length - 1];
     this.svg.removeChild(vertex);
     vertex = null;
     this.svgEls.vertices.pop();

     if (this.svgEls.lines.length > 0) {
       let line = this.svgEls.lines[this.svgEls.lines.length - 1];
       this.svg.removeChild(line);
       line = null;
       this.svgEls.lines.pop();
     }
   }
}

/* harmony default export */ __webpack_exports__["a"] = WidgetEnvelopeGraph;


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Useful Math Utility functions
 */
let MathUtil = {

  /**
   * Quantize a value (set it to the closest value matching the interval)
   * Note: result will not necessarily reflect the same number of places of
   * as the q input due to floating point arithmetic.
   * @param {number} val - Value to quantize
   * @param {number} q - The quantization interval
   * @return {number} qVal - Quantized val
   */
  quantize: function quantize(val, q) {
    let qVal;

    if (q == 0) {
      return 0;
    } else if (q < 0) {
      q = Math.abs(q);
    }

    // quantize
    qVal = ~~(val / q) * q;

    qVal = Math.abs(val - qVal) > (q / 2)
      ? qVal > 0
        ? qVal + q
        : qVal - q
      : qVal;

    return qVal;
  },

  /**
   * Alias for quantize(val, q)
   * @param {number} val - Value to quantize
   * @param {number} q - The quantization interval
   * @return {number} qVal - Quantized val
   */
  q: function q(val, q) {
    return MathUtil.quantize(val, q);
  }
}

/* harmony default export */ __webpack_exports__["a"] = MathUtil;


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Mixin for methods related to observer callback support
 * @mixin
 */
let WidgetObserverMixin = {

  /**
   * Register a new observer function that will recieve the state value every time the state is updated.
   * @public
   * @param {function} newObserver - The new observer function to be notified every time the state changes.
   * @return {boolean} isChanged - Indicates whether an observer was added.
   */
  addObserver: function addObserver(newObserver) {
    let isChanged = false;

    if (!(this.observers.find(observer => observer === newObserver))) {
      this.observers.push(newObserver);
      isChanged = true;
    }

    return isChanged;
  },

  /**
   * Remove an observer function from being notified when the state changes.
   * @public
   * @param {function} targetObserver - The observer function to be removed.
   * @return {boolean} isChanged - Indicates whether an observer has been removed
   */
  removeObserver: function removeObserver(targetObserver) {
    const _this = this;
    let isChanged = false;

    this.observers.forEach((observer, idx) => {
      if (observer === targetObserver) {
        _this.observers.splice(idx, 1);
        isChanged = true;
      }
    });

    return isChanged;
  },

  /**
   * Notify all observers of new state
   * @protected
   */
  _notifyObservers() {
    const _this = this;
    this.observers.forEach(observer => observer(_this.getPublicState()));
  }
}

/* harmony default export */ __webpack_exports__["a"] = WidgetObserverMixin;


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Mixin for methods related to options
 * @mixin
 */
let WidgetOptionsMixin = {

  /**
   * Get the options object
   * @public
   * @return {object} this.o - Options
   */
  getOptions: function getOptions() {
    return this.o
  },

  /**
   * Set the options
   * Uses a diffing function, so only specified keys that have new values will be changed
   * @public
   * @param {object} o - options
   * @return {boolean} isChanged - Returns a boolean indicating whether any option has been changed
   */
  setOptions: function setOptions(o) {
    const _this = this;
    o = o || {};
    let isChanged = false;

    Object.keys(o).forEach(key => {
      if (_this.o.hasOwnProperty(key) && _this.o[key] !== o[key]) {
        _this.o[key] = o[key];
        isChanged = true;
      }
    });

    if (isChanged) {
      this._initStateConstraints();
      this._setState();
    }

    return isChanged;
  }
}

/* harmony default export */ __webpack_exports__["a"] = WidgetOptionsMixin;


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constraint__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__constraint_spec__ = __webpack_require__(1);



/**
 * Mixin for methods related to state management
 * @mixin
 */
let WidgetStateMixin = {

  /**
   * Get the current state
   * @public
   * @return {object} this.state
   * @override
   */
  getState: function getState() {
    return this.state;
  },

  /**
   * Set the current state and redraw.
   * If no new state argument is provided, will reassign old state, taking into account the stateConstraints.
   * As opposed to _setState(), does not trigger observer notification.
   * Uses a diffing function, so only state that is different will lead to an update.
   * Will use Widget.stateConstraints to constrain each state value to each constraints min, max, or enum
   * @public
   * @param {object=} newState - The new state.
   * @return {boolean} isChanged - Returns a boolean indicating whether the state has been changed
   */
  setState: function setState(newState) {
    const _this = this;
    let isChanged = false;

    newState = newState || this.getState();

    Object.keys(newState).forEach(key => {
      if (_this.state.hasOwnProperty(key) && _this.state[key] !== newState[key]) {
        _this.state[key] = newState[key];
        isChanged = true;
      }
    });

    if (isChanged === true) {
      _this.stateConstraints.constrain(_this.state);
      this._finalizeState();
      this._update();
    }

    return isChanged;
  },

  /**
   * Set the current state.
   * As opposed to the public version (setState()), _setState() will call the observer callback functions,
   * so may lead to an infinate loop if an observer calls this method.
   * Uses a diffing function, so only state that is different will lead to an update.
   * @protected
   * @param {object=} newState - The new state.
   * @return {boolean} isChanged - Returns a boolean indicating whether the state has been changed
   */
  _setState: function _setState(newState) {
    const _this = this;

    if (this.setState(newState)) {
      this._notifyObservers();
      return true;
    }

    return false;
  }
}

/* harmony default export */ __webpack_exports__["a"] = WidgetStateMixin;


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Mixin specifying the xml namespace for SVG
 * @mixin
 */
/* harmony default export */ __webpack_exports__["a"] = {
  SVG_NS: "http://www.w3.org/2000/svg"
};


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_impl_dial__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_impl_envelopegraph__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__constraint_spec__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__constraint__ = __webpack_require__(0);






/** Dial */
let dialContainer = document.getElementById("dial");
let dialDisplay = dialContainer.nextElementSibling;
let dial = new __WEBPACK_IMPORTED_MODULE_0__widget_impl_dial__["a" /* default */](dialContainer);
dial.addObserver((state) => {
  dialDisplay.innerHTML = state;
});
dial._setState({val: 300});

/** Envelope Graph */
let envelopeGraphContainer = document.getElementById("envelope-graph");
let envelopeGraphDisplay = envelopeGraphContainer.nextElementSibling;
let envelopeGraph = new __WEBPACK_IMPORTED_MODULE_1__widget_impl_envelopegraph__["a" /* default */](envelopeGraphContainer, {
  hasFixedStartPoint: true,
  hasFixedEndPoint: true
});
envelopeGraph.addObserver(function(state) {
  envelopeGraphDisplay.innerHTML = state.map((xyPair) => "[" + xyPair[0] + ", " + xyPair[1] + "]");
})

//envelopeGraph.addVertex(2, 20);
//envelopeGraph.addVertex(25, 200);


/***/ })
/******/ ]);