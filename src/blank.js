(function(){
	var _;

	function Blank (target) {
		this.target = target;
	}

	_ = Blank;

	Blank.define = function(module) {
		var name, value;

		if ('methods' in module) {
			for (name in module.methods) {
				this.constructor.prototype[name] = module.methods[name];
			}
		}

		if ('utils' in module) {
			for (name in module.utils) {
				this[name] = module.utils[name];
			}
		}
	};

	Blank.method = function(name, fn) {
		this.constructor.prototype[name] = fn;
	};

	Blank.methods = function(methods) {
		var name;
		for (name in methods) {
			this.method(name, methods[name]);
		}
	};

	Blank.util = function(name, fn) {
		this[name] = fn;
	};

	Blank.utils = function(utils) {
		var name;
		for (name in utils) {
			this.util(name, utils[name]);
		}
	};

	// Test functions
	
	function isFunction(target) {
		return typeof(target) === 'function';
	};

	function isObject(target) {
		return typeof(target) === 'object';
	};

	function isString(target) {
		return typeof(target) === 'string';
	};

	function isBoolean(target) {
		return typeof(target) === 'boolean';
	};

	function isNumber(target) {
		return typeof(target) === 'number';
	};

	function isArray(target) {
		return isObject(target) && target instanceof Array;
	};

	function isError(target) {
		return isObject(target) && target instanceof Error;
	};

	Blank.define({
		utils : {
			isFunction : isFunction,
			isObject   : isObject,
			isArray    : isArray,
			isBoolean  : isBoolean,
			isNumber   : isNumber,
			isError    : isError
		}
	});

	// SHORT HANDS ------------------------------------------------------------
	
	function extend (target, source) {
		var sources, prop;
		sources = Array.prototype.slice.call(arguments, 1);

		while(sources.length) {
			source = sources.shift();
			for (prop in source) {
				target[prop] = source[prop];
			}
		}

		return target;
	};

	/**
	 * Merge objects and use strategy for conflicts
	 * 
	 * @param  {Object}   target   Target to merge in
	 * @param  {Object}   source   Source to merge with target
	 * @param  {Function} strategy Function to resolve conflicts
	 * @return {Object}            Target object
	 */
	function merge (target, source, strategy) {
		var sources, prop, value;
		sources = Array.prototype.slice.call(arguments, 1);

		if (sources.length && typeof sources[sources.length - 1] === 'function') {
			strategy = sources.pop();
		} else {
			strategy = function(a, b) {
				if (isArray(a)) {
					return a.concat(b);
				} else if (isObject(a) && isObject(b)) {
					return merge(a,b, strategy);
				} else {
					return undefined;
				}
			};
		}

		while(sources.length) {
			source = sources.shift();
			for (prop in source) {
				if (strategy && target.hasOwnProperty(prop)) {
					value = strategy(target[prop], source[prop]);
					
					if (typeof value === 'undefined') {
						value = source[prop];
					}

					target[prop] = value;
				} else {
					target[prop] = source[prop];
				}
			}
		}

		return target;
	}

	Blank.utils({
		extend : extend,
		merge  : merge
	});

	Blank.method('extend', function(source) {
		this._target = _.extend(this._target, source);
		return this;
	});
	
	// ENVIRONMENT DETECTION --------------------------------------------------
	
	Blank.define({
		utils : {

			environment : function() {
				var env = {
					type : 'unknown',
					version : undefined,
					v       : undefined
				};

				if (this.isBrowser()) {
					env.type = 'browser';
					// TODO : add version and programm name support
				} else if (this.isNodeJs()) {
					env.type = 'nodejs'
					env.version = env.v = process.version;
				} else {
					env.type = 'unknown'
				}

				return env;
			},

			isBrowser : function() {
				return typeof window !== 'undefined';
			},

			isIE : function() {
				if (typeof this._ie === 'undefined') {
					this._ie = this.isBrowser() && ('ActiveXObject' in window);
				}

				return this._ie;
			},

			browser : function(version, callback) {
				if ( ! this.isBrowser()) return this;

				if (arguments.length === 1) {
					// TODO: add version and browser name support
					callback = version;
					callback();
				} else {
					throw new Error('Version support not added yet');
				}

				return this;
			},

			isNodeJs : function() {
				return typeof process !== 'undefined' && process.title === 'node';
			},

			nodeJs : function(version, callback) {
				if ( ! this.isNodeJs()) return this;

				if (arguments.length === 1) {
					callback = version;
					callback();
				} else {
					throw new Error('Version support not added yet');
				}

				return this;
			}
		}
	});

	/*
		Browser dependant functions
	 */
	Blank.browser(function() {
		Blank.utils({
			addListener : function(target, event, callback) {
				if (! this.isIE()) {
					target.addEventListener(event, callback);
				} else {
					target.attachEvent(event, callback);
				}
			},

			removeListener : function(target, event, callback) {
				if (! this.isIE()) {
					target.removeEventListener(event, callback);
				} else {
					target.detachEvent(event, callback);
				}
			}
		});

		window.blank = Blank;
		window._     = Blank;
	});

	Blank.nodeJs(function(){
		module.exports = Blank;
	});

})();