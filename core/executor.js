define(
	'core/executor', [
		'./timer',
		'./persister',
		'./dependencymanager',
		'./treeannotator',
		'./pl/nodeidgenerator'
	],
	function(Timer, LocalStoragePersister, DependencyManager, TreeAnnotator, NodeIdGenerator) {

		

		var Executor = function(options) {

			// options & defaults
			this.commands = options.commands || [];
			this.workflowName = options.workflowName;
			this.defaultSkipAfter = options.defaultSkipAfter || 1000;
			this.timeInterval = options.timeInterval || 1000;
			this.dependencyManager = options.dependencyManager;
			this.persister = options.persister || LocalStoragePersister;
			this.delegate = options.delegate || { 
				commandDidComplete: function() {},
				workflowDidComplete: function() {},
				checkpointWasReached: function() {},
				assertionDidComplete: function() {},
				commandMayExecute: function() {}
			};

			var commandCount;

			// starts the workflow process. is called every time a dependency check is passed
			this.go = function(afterDelay) {
				afterDelay = afterDelay || this.timeInterval;

				var _n = getNextNode(this.commands);
				if (_n) {
					fireAsynchronously(this.delegate.commandMayExecute, { 
						nodeDesc: _n.getModifiersPretty(), 
						inMs: afterDelay,
						selectors: _n.getSelectors() 
					});
				}

				timer.interval = afterDelay;
				LocalStoragePersister.setCurrentWorkflow(this.workflowName);
				timer.start();
			};

			// called when the workflow is completed
			this.stop = function() {
				LocalStoragePersister.setCurrentWorkflow('');
				NodeIdGenerator.reset();
				fireAsynchronously(this.delegate.workflowDidComplete, { name: this.workflowName })
				timer.stop();
				console.log('All done!');
			};
			
			// the heart!
			function executeCommand() {
				if (this.dependencyManager.dependenciesAreFulfilled()) {

					// find next node and set its control-flow info
					var node = getNextNode(this.commands);
					if (!node) {
						this.persister.clearKeys();
						return this.stop();
					}
					var controlFlowInfo = this.persister.getNodeControlFlowInfo(node.nodeId);
					node.setControlFlowInfo(controlFlowInfo);

					// if this is a checkpoint/assert node, fire the callback
					if (fireCallbackIfNecessary.call(this, node)) {
						node.didExecute();
						
						if (!getNextNode(this.commands)) {
							this.persister.clearKeys();
							this.stop();
						}
						else {
							setNextInterval.call(this);
							this.go();
						}
						
						return;
					}

					// get the node's command
					var command = node.getCommand();
					if (!command) {
						// is this ever reached?
						debugger;
						this.stop();
						return;
					}

					// keep track of our dependency Fulfillment checks
					command.attemptToFulfillDependencies();
					node.numberOfDependencyFulfillmentAttempts++;

					// if command has a "skip after n times" we've already tried to run this command more than n times, skip it
					if (command.shouldBeSkipped()) {
						console.log('[Skipping] ' + node.nodeId + ' ' + command.name + ' ... ');
						node.didExecute();

						var payload = _buildCommandDidCompletePayload(this.workflowName, command, node.getControlFlowInfo(), 'skipped');
						fireAsynchronously(this.delegate.commandDidComplete, payload)
					}
					// is the command ready to be executed?
					else if (command.dependenciesAreFulfilled()) {

						// execute. let the node know, and fire any delegate events
						console.log(node.nodeId + ' ' + command.name + ' ... ');
						command.execute();
						node.didExecute();

						var payload = _buildCommandDidCompletePayload(this.workflowName, command, node.getControlFlowInfo(), 'executed');
						fireAsynchronously(this.delegate.commandDidComplete, payload);

						// if we're done, stop now (don't wait 1 second to stop after finding no commands)
						// TODO: put this in a method like hasNext() and call it when a command is skipped (ctrl+f "shouldBeSkipped")
						if (!getNextNode(this.commands)) {
							this.persister.clearKeys();
							this.stop();
							return;
						}

						setNextInterval.call(this);

						// reset our flytrap-level dependencies
						this.dependencyManager.reset();
					}
					else {
						var payload = _buildCommandDidCompletePayload(this.workflowName, command, node.getControlFlowInfo(), 'spinning');
						fireAsynchronously(this.delegate.commandDidComplete, payload);
					}
				}

				this.go();
			}

			// our timer will fire off an execution attempt every [timeInteral] ms
			var timer = new Timer(this.timeInterval, executeCommand.bind(this));
			
			// private method recursively gets the next node
			function getNextNode(commands) {
				return _getNextNode(commands);
			}

			// private recursive helper
			function _getNextNode(node) {
				if (node.shouldExecute()) {
					return node;
				}

				// it is possible that an each node of the form "each @x in y.z" where z is undefined
				// in this case, we do not want to enter the block
				// so we call the shouldEnterBlock method which returns true by default
				// but the each node overrides it to check that it actually has a valid iterable
				// don't traverse the children if we shouldn't enter the block
				if (!node.shouldEnterBlock()) {
					return null;
				}
				
				// depth first traverse
				for (var i = 0;i < node.children.length;++i) {
					var n = _getNextNode(node.children[i]);
					if (n) {
						return n;
					}
				};

				return null;
			}

			function setNextInterval() {
				// check to see if we need to run the next command quicker or slower
				var nextNode = getNextNode(this.commands);
				this.timeInterval = nextNode.getAfterDelay() || this.timeInterval;
			}

			// private methods
			function fireCallbackIfNecessary(node) {
				switch(node.type) {
					case 'assert':
						fireAsynchronously(this.delegate.assertionDidComplete, node.getAssertionResult());
						return true;
					case 'checkpoint':
						fireAsynchronously(this.delegate.checkpointWasReached, node.getCheckpointDescription());
						return true;
					default:
						return false;
				}
			}

			function _buildCommandDidCompletePayload(workflowName, command, nodeInfo, status) {
				return { 
					status: status, 
					command: { workflowName: workflowName, commandDesc: (command.subcommands[0] || command).name }, 
					nodeInfo: nodeInfo
				};
			}

			function fireAsynchronously(callback, payload) {
				if (callback == null)
					return;

				setTimeout(function() { 		// TODO: callback.bind(window, payload)
					callback(payload); 
				}, 0);
			}
		};

		

		return Executor;
	}
);
