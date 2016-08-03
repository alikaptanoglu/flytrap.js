define(
	'core/command', [
		'./dependencymanager'
	],
	function(DependencyManager) {
		
		

		var Command = function(options) {
			this.totalExecutions 	= 0;
			this.dependencyManager 	= new DependencyManager();
			this.numFulfillAttempts = 0;
			this.name               = options.name || '';
			this.skipAfter          = options.skipAfter || 60;
			this.dependencies       = [] || options.dependencies;
			this.callback           = function() { };
			this.subcommands		= [];
			this.afterDelay			= options.runAfterDelay || 1000;
		};

		// build Command.prototype
		(function() {

			this.click = function(selector) {
				this.withDependency(selector);
				var subcommand = new Command({ name: 'Click ' + selector })
					.withDependency(selector)
					.withCallback(function(clickables) {
						for(var i = 0;i < clickables.length;++i) {
							//var evt = new MouseEvent("click", { bubbles: true });
							//var evt = new Event('click', { bubbles: true });
							//clickables[i].dispatchEvent(evt);

							var evt = document.createEvent('Event');
							evt.initEvent('click', true, true);
							clickables[i].dispatchEvent(evt);
						}
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.bubbleEvent = function(selector, eventName) {
				this.withDependency(selector);
				var subcommand = new Command({ name: 'Bubble ' + eventName +' ' + selector })
					.withDependency(selector)
					.withParameter(eventName)
					.withCallback(function(eventable, eventName) {
						for(var i = 0;i < eventable.length;++i) {
							//eventable[i].dispatchEvent(new Event(eventName, { 'bubbles': true }));

							var evt = document.createEvent('Event');
							evt.initEvent(eventName, true, true);
							eventable[i].dispatchEvent(evt);

						}
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.hardClick = function(selector) {
				return this.bubbleEvent(selector, 'click');
			}

			this.uncheck = function(selector) { 
				return this.check(selector, false); 
			}

			this.check = function(selector, value) {
				this.withDependency(selector);
				if (value == null) value = true;
				var subcommand = new Command({ name: (value ? 'Checking ' : 'Unchecking ') + selector })
					.withDependency(selector)
					.withParameter(value)
					.withCallback(function(checkables, value) {
						for(var i = 0;i < checkables.length;++i) {
							//debugger;
							checkables[i].checked = value;
						}
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.value = function(selector, value) {
				this.withDependency(selector);
				if (value == null) value = true;
				var subcommand = new Command({ name: 'Setting value of ' + selector + ' to ' + value })
					.withDependency(selector)
					.withParameter(value)
					.withCallback(function(inputs, value) {
						for(var i = 0;i < inputs.length;++i) {
							inputs[i].value = value.selector || value;
						}
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.hash = function(hash) {
				var subcommand = new Command({ name: 'Setting window.location.hash: ' + hash })
					.withParameter(hash)
					.withCallback(function(hash) {
						window.location.hash = hash;
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.log = function(message) {
				var subcommand = new Command({ name: 'Logging message: ' + message })
					.withParameter(message)
					.withCallback(function(message) {
						console.log(message);
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.focus = function(selector) {
				this.withDependency(selector);
				var subcommand = new Command({ name: 'Focus on ' + selector })
					.withDependency(selector)
					.withCallback(function(focusees) {
						for(var i = 0;i < focusees.length;++i) {
							focusees[i].focus();
						}
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.goto = function(url) {
				var subcommand = new Command({ name: 'Changing URL to ' + url })
					.withParameter(url)
					.withCallback(function(_url) {
						window.location.href = _url;
					});
				this.subcommands.push(subcommand);
				return this;
			}

			this.antidependency = function(selector) {
				return this.withDependency({_anti_: selector});
			}

			this.dependency 	=
			this.withDependency = function(selector, dependencyType) {
				this.dependencyManager.addDependency(selector, dependencyType);
				return this;
			}

			this.parameter 		= 
			this.withParameter 	= function(parameter) {
				this.withDependency({_parameter_: parameter});
				return this;
			}

			this.run = function(dependencies, callback) {
				var subcommand = new Command({ name: 'Subcommand callback' });
				for(var i = 0;i < dependencies.length;++i) {
					if (dependencies[i]._parameter_ !== undefined)
						subcommand.withParameter(dependencies[i]._parameter_);
					else {
						this.withDependency(dependencies[i]);
						subcommand.withDependency(dependencies[i]);
					}
				}
				subcommand.withCallback(callback);
				this.subcommands.push(subcommand);
				return this;
			}

			this.each =
			this.eachWithDependencyCheck = function(objects, callback) {
				var subcommand = new Command({ name: 'Subcommand each w/ dep check'})
					.withParameter(objects)
					.withParameter(callback)
					.withCallback(function(objects, callback) {
						for(var i = 0;i < objects.length;++i) {
							callback(objects[i], i);
						}
					});

				this.subcommands.push(subcommand);
				return this;
			}

			this.withCallback 	= function(callback) {
				this.callback = callback;
				return this;
			}

			this.skipAfterAttempts = function(numAttempts) {
				this.skipAfter = numAttempts;
				return this;
			}

			this.attemptToFulfillDependencies = function() {
				this.dependencyManager.attemptToFulfillDependencies();
				++this.numFulfillAttempts;
			}
			
			this.dependenciesAreFulfilled = function() {
				return this.dependencyManager.dependenciesAreFulfilled();
			}

			this.shouldBeSkipped = function() {
				return this.numFulfillAttempts > this.skipAfter ? true : this.dependencyManager.shouldBeSkipped();
			}

			this.afterSeconds = function(seconds) {
				return this.runAfterDelay(seconds * 1000);
			}

			this.runAfterDelay = function(delayMs) {
				this.afterDelay = delayMs;
				return this;
			}

			this.exists = function(selector) {
				return this
					.withParameter(selector)
					.withCallback(function(selector) {
						return this.dependencyManager.query(selector, true).length > 0;
					});
			}

			this.execute = function() {
				for(var i = 0;i < this.subcommands.length;++i) {
					this.subcommands[i].execute();
				}
				var args = this.dependencyManager.getDependencyValues();
				args.push(this.totalExecutions++);
				var result = this.callback.apply(this, args);
				return result;
			}

			this.reset = function() {
				numFulfilledAttempts = 0;
				this.dependencyManager.reset();
				for(var i = 0;i < this.subcommands.length;++i) {
					this.subcommands[i].reset();
				}
			}

		}).call(Command.prototype)

		

		return Command;
	}
);
