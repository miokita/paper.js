/*
 * Paper.js
 *
 * This file is part of Paper.js, a JavaScript Vector Graphics Library,
 * based on Scriptographer.org and designed to be largely API compatible.
 * http://paperjs.org/
 * http://scriptographer.org/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * Copyright (c) 2011, Juerg Lehni & Jonathan Puckey
 * http://lehni.org/ & http://jonathanpuckey.com/
 *
 * All rights reserved.
 */

var PathStyle = this.PathStyle = Base.extend(new function() {
	/** @lends PathStyle# */

	// windingRule / resolution / fillOverprint / strokeOverprint are currently
	// not supported. The full list of properties would be:
	//	['windingRule', 'resolution', 'strokeColor', 'strokeWidth',
	//		'strokeCap', 'strokeJoin', 'miterLimit', 'dashOffset','dashArray',
	//		'strokeOverprint', 'fillColor', 'fillOverprint'],
	var keys = ['strokeColor', 'strokeWidth', 'strokeCap', 'strokeJoin',
				'miterLimit', 'dashOffset','dashArray', 'fillColor'],
		strokeFlags = {
			strokeWidth: true,
			strokeCap: true,
			strokeJoin: true,
			miterLimit: true
		};

	var fields = {
		beans: true,

		// DOCS: why isn't the example code showing up?
		/**
		 * PathStyle objects don't need to be created directly. Just pass an
		 * object to {@link Item#style} or {@link Project#currentStyle}, it will
		 * be converted to a PathStyle object internally.
		 *
		 * @constructs PathStyle
		 * @param {object} style
		 * 
		 * @class PathStyle is used for changing the visual styles of items
		 * contained within a Paper.js project and is returned by
		 * {@link Item#style} and {@link Project#currentStyle}.
		 * 
		 * All properties of PathStyle are also reflected directly in {@link Item},
		 * i.e.: {@link Item#fillColor}.
		 * 
		 * To set multiple style properties in one go, you can pass an object to
		 * {@link Item#style}. This is a convenient way to define a style once and
		 * apply it to a series of items:
		 * 
		 * Sample Code:
		 * <pre>
		 * var circleStyle = {
		 * 	fillColor: new RGBColor(1, 0, 0),
		 * 	strokeColor: new GrayColor(1),
		 * 	strokeWidth: 5
		 * };
		 * 
		 * var path = new Path.Circle(new Point(50, 50), 50);
		 * path.style = circleStyle;
		 * </pre>
		 */
		initialize: function(style) {
			// Note: This relies on bean setters that get implicetly
			// called when setting values on this[key].
			for (var i = 0, l = style && keys.length; i < l; i++) {
				var key = keys[i],
					value = style[key];
				if (value !== undefined)
					this[key] = value;
			}
		},

		statics: {
			create: function(item) {
				var style = new PathStyle(PathStyle.dont);
				style._item = item;
				return style;
			}
		}
	};

	Item.inject(Base.each(keys, function(key) {
		var isColor = !!key.match(/Color$/),
			part = Base.capitalize(key),
			set = 'set' + part,
			get = 'get' + part;

		fields[set] = function(value) {
			var children = this._item && this._item._children;
			value = isColor ? Color.read(arguments) : value;
			if (children) {
				for (var i = 0, l = children.length; i < l; i++)
					children[i]._style[set](value);
			} else {
				var old = this['_' + key];
				if (old != value && !(old && old.equals && old.equals(value))) {
					this['_' + key] = value && value.clone ? value.clone() : value;
					if (this._item) {
						this._item._changed(ChangeFlags.STYLE
							| (strokeFlags[key] ? ChangeFlags.STROKE : 0));
					}
				}
			}
			return this;
		};

		fields[get] = function() {
			var children = this._item && this._item._children,
				style;
			// If this item has children, walk through all of them and see if
			// they all have the same style.
			if (children) {
				for (var i = 0, l = children.length; i < l; i++) {
					var childStyle = children[i]._style[get]();
					if (!style) {
						style = childStyle;
					} else if (style != childStyle && !(style && style.equals
							&& style.equals(childStyle))) {
						// If there is another item with a different style,
						// the style is not defined:
						// PORT: Change this in Sg (currently returns null)
						return undefined;
					}
				}
				return style;
			} else {
				return this['_' + key];
			}
		};

		// Style-getters and setters for Item:
		// 'this' = the Base.each() side-car = the object that is returned from
		// Base.each and injected into Item above:
		this[set] = function(value) {
			this._style[set](value);
			return this;
		};

		this[get] = function() {
			return this._style[get]();
		};
	}, { beans: true }));

	return fields;
});

/**
 * {@grouptitle Stroke Style}
 * 
 * The color of the stroke.
 * 
 * @example
 * // Create a circle shaped path at { x: 50, y: 50 } with a radius of 10:
 * var circle = new Path.Circle(new Point(50, 50), 10);
 * 
 * // Set the stroke color of the circle to RGB red:
 * circle.strokeColor = new RGB(1, 0, 0);
 * 
 * @property
 * @name PathStyle#strokeColor
 * @type RGBColor|HSBColor|GrayColor
 */

/**
 * The width of the stroke.
 * 
 * @example
 * // Create a circle shaped path at { x: 50, y: 50 } with a radius of 10:
 * var circle = new Path.Circle(new Point(50, 50), 10);
 * 
 * // Set the stroke width of the circle to 3pt:
 * circle.strokeWidth = 3;
 * 
 * @property
 * @name PathStyle#strokeWidth
 * @type number
 */

// DOCS: PathStyle#strokeCap: describe the different options
/**
 * The cap of the stroke.
 * 
 * @example
 * // Create a line from { x: 0, y: 50 } to { x: 50, y: 50 };
 * var line = new Path.Line(new Point(0, 50), new Point(50, 50));
 * 
 * // Set the stroke cap of the line to be round:
 * line.strokeCap = 'round';
 * 
 * @property
 * @name PathStyle#strokeCap
 * @type string
 */

// DOCS: PathStyle#strokeJoin: describe the different options
/**
 * The join of the stroke.
 * 
 * @property
 * @name PathStyle#strokeJoin
 * @type string
 */

/**
 * The dash offset of the stroke.
 * 
 * @property
 * @name PathStyle#dashOffset
 * @type number
 */

/**
 * Specifies an array containing the dash and gap lengths of the stroke.
 * 
 * @example
 * // Create a line from { x: 0, y: 50 } to { x: 50, y: 50 };
 * var line = new Path.Line(new Point(0, 50), new Point(50, 50));
 * 
 * line.strokeWidth = 3;
 * 
 * // Set the dashed stroke to [10pt dash, 5pt gap, 8pt dash, 10pt gap]:
 * line.dashArray = [10, 5, 8, 10];
 * 
 * @property
 * @name PathStyle#dashArray
 * @type array
 */

/**
 * The miter limit of the stroke.
 * 
 * @property
 * @name PathStyle#miterLimit
 * @type number
 */

/**
 * {@grouptitle Fill Style}
 * 
 * The fill color.
 * 
 * @example
 * // Create a circle shaped path at { x: 50, y: 50 } with a radius of 10:
 * var circle = new Path.Circle(new Point(50, 50), 10);
 * 
 * // Set the fill color of the circle to RGB red:
 * circle.fillColor = new RGBColor(1, 0, 0, );
 * 
 * @property
 * @name PathStyle#fillColor
 * @type RGBColor|HSBColor|GrayColor
 */