define(
	'core/dependencymanager', [
		'./dependency'
	],
	function(Dependency) {

		

		var DependencyManager = function() {
			this.dependencies = [];
		};

		// build DependencyManager.prototype
		(function() {

			this.addDependency = function(selector, dependencyType) {
				this.dependencies.push(new Dependency(selector, dependencyType));
			}

			this.dependenciesAreFulfilled = function() {
				for(var i = 0;i < this.dependencies.length;++i) {
					if (!this.dependencies[i].attemptToFulfill() && !this.dependencies[i].isFulfilled) {
						return false;
					}
				}
				return true;
			}

			this.attemptToFulfillDependencies = function(resolvedVariables) {
				
				for(var i = 0;i < this.dependencies.length;++i) {
					this.dependencies[i].attemptToFulfill();
				}
			}

			this.reset = function() {
				for(var i = 0;i < this.dependencies.length;++i) {
					this.dependencies[i].reset();
				}
			}

			this.shouldBeSkipped = function() {
				for(var i = 0;i < this.dependencies.length;++i) {
					if (this.dependencies[i].isSkippable()) {
						return true;
					}
				}
				return false;
			}

			this.getDependencyValues = function() {
				var values = [];
				for(var i = 0;i < this.dependencies.length;++i) {
					values.push(this.dependencies[i].getDependencyValue());
				}
				return values;
			}

			this.convertToDependencyValues = function(depObjects) {
				var results = [];
				for(var i = 0;i < depObjects.length;++i) {
					results.push(new Dependency(depObjects[i]).getDependencyValue());
				}
				return results;
			}

			this.query = function(selector, verbose) {
				return Dependency._query(selector, verbose);
			}

		}).call(DependencyManager.prototype)

		DependencyManager.setDOMContext = function(context) {
			Dependency.setDOMContext(context);
		}

		DependencyManager.getElements = function(selectors) {
			return Dependency.getElements(selectors);
		}

		

		return DependencyManager;
	}
);
