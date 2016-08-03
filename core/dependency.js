define(
	'core/dependency', 
	[],
	function() {

		

		DependencyTypes = {
			Regular: 0,
			Anti: 1,
			SkipIfExists: 2,
			SkipIfNotExists: 3,
			Parameter: 4
		}

		var DependencyType = function(typeEnum) {
			this.type = typeEnum;
		};

		// build DependencyType.prototype
		(function() {
			this.isRegular 			= function() { return this.type === DependencyTypes.Regular; }
			this.isAnti 			= function() { return this.type === DependencyTypes.Anti; }
			this.isParameter 		= function() { return this.type === DependencyTypes.Parameter; }
			this.isSkipIfExists 	= function() { return this.type === DependencyTypes.SkipIfExists; }
			this.isSkipIfNotExists 	= function() { return this.type === DependencyTypes.SkipIfNotExists; }
		}).call(DependencyType.prototype)

		// static helper function
		DependencyType.deduce = function(selector) {

			// if the selector is a string, it must be a regular one
			// because there is currently no way to encode another type via the string
			// as opposed to below
			if (typeof selector == 'string') 
				return DependencyTypes.Regular;
			
			var propTypes = {
				"_anti_": 				DependencyTypes.Anti,
				"_antidependency_": 	DependencyTypes.Anti,
				"_parameter_": 			DependencyTypes.Parameter,
				"_optional_": 			DependencyTypes.Optional,
				"_skipIfExists_": 		DependencyTypes.SkipIfExists,
				"_skipIfNotExists_": 	DependencyTypes.SkipIfNotExists
			}

			// if the selector is of the form { _anti_: "asdf" } (or variation above)
			// use the property name to find it
			// if this is unsuccessful, just use Regular
			var propNames = Object.getOwnPropertyNames(selector);
			return propNames.length === 1 
				? propTypes[propNames[0]] || DependencyTypes.Regular 
				: DependencyTypes.Regular;
		};

		// the main guy for the file
		var Dependency = function(selector, dependencyType) {

			// type of dependency
			this.type = new DependencyType(dependencyType || DependencyType.deduce(selector));
			
			// flag
			this.isFulfilled = false;

			// a string representation of the actual selector passed in by teh script
			var undefined;
			this.selector = selector._parameter_ !== undefined		
							? 	selector._parameter_	// if a parameter's value is actually null, don't fall through via ||'s
							: 	selector._anti_ || 
								selector._antidependency_ || 
								selector._optional_ || 
								selector._skipIfExists_ || 
								selector._skipIfNotExists_ || 
								selector;
		};

		// build Dependency.prototype
		(function() {

			this.attemptToFulfill = function() {

				// if we're alreayd fulfilled, we return false
				// because we only want to return true if we actually successfully fulfilled in this run, yeah weird
				if (this.isFulfilled) {
					return false;
				}

				// run the selectors against sizzle to determine the state of our dependencies
				var elements = Dependency._query(this.selector, true)	// verbose: true

				if ((this.type.isRegular() && elements.length > 0) 
					|| (this.type.isAnti() && elements.length == 0) 
					|| this.type.isParameter()) {
					this.isFulfilled = true;
					return true;
				}
				return false;
			}

			this.getDependencyValue = function() {
				return this.type.isParameter() ? this.selector : Dependency._query(this.selector);
			}

			this.isSkippable = function() {
				var elements = Dependency._query(this.selector);
				return (this.type.isSkipIfExists() && elements.length > 0) 
						|| (this.type.isSkipIfNotExists() && elements.length == 0);
			}

			this.reset = function() {
				this.isFulfilled = false;
			}

		}).call(Dependency.prototype);

		// is this even used anymore?
		Dependency.setDOMContext = function(context) {
			Dependency.DOMContext = context;
		}

		// static helper
		Dependency.getElements = function(selectors) {
			return selectors.map(function(selector) {
				return Dependency._query(selector);
			});
		}

		// static helper
		Dependency._query = function(selector, verbose) {
			var sizzleIsLoaded = typeof(Sizzle) !== 'undefined';
			try {

				// find elements
				var elements = sizzleIsLoaded
					? Sizzle(selector, Dependency.DOMContext) 
					: document.querySelectorAll(selector);
			}
			catch (e) {

				// display a reason why it might've failed
				if (verbose) console.error(
					!sizzleIsLoaded 
						? 'selector ' + selector + ' is invalid.  Consider including a reference to Sizzle.js.'
						: e.toString()
				);
			}

			return elements || [];
		}
		
		

		return Dependency;
	}
);
