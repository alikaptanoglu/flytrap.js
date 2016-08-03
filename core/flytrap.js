define(
	'core/flytrap', [
		'./command',
		'./executor',
		'./dependencymanager',
		'./treeannotator'
	],
	function(Command, Executor, DependencyManager, TreeAnnotator) {

		

		// override confirm (although this doesn't work in the chrome extension)
		window.confirm = function(question) {
			console.log('Answering YES to: ' + question);
			return true;
		}

		var Flytrap = function(options) {
			if (!options) throw "please provide options. minimum: { code: 'flytrap...' }.";
			if (!options.name/* || options.code == null*/) options.name = new Date().getTime();
			if (!options.code) throw 'please provide code property.';


			this.commands = [];
			this.dependencyManager = new DependencyManager();
			this.name = options.name;
			//this.code = options.code;

			// workflows are compositions of the following methods
			this.do =
			this.perform = 
			this.addCommand = function(name) {
				var command = new Command({ name: name });
				this.commands.push(command);
				return command;
			}

			this.withDependency = function(selector, dependencyType) {
				this.dependencyManager.addDependency(selector, dependencyType);
				return this;
			}

			this.workflowExecutor = null;
			this.go = function() {

				this.workflowExecutor = new Executor({
					commands: this.annotatedCommands,
					dependencyManager: this.dependencyManager,
					workflowName: this.name,
					delegate: this.delegate
				});
				
				this.workflowExecutor.go();
			}

			// helper methods
			this.antidependency = 
			this.withAntidependency = function(selector) { 
				return this.withDependency({_anti_: selector}); 
			}

			this.withCommandTree = function(rootNode) {

				// rootNode is the head of an node graph that runs the automation

				// go through each modifier (e.g., antidependency, dependency, etc.)
				for(var i = 0;i < rootNode.modifiers.length;++i) {

					// get the value for each operand and call its helper
					for(var j = 0;j < rootNode.modifiers[i].operands.length;++j) {
						var exprVal = rootNode.evaluateExpression(rootNode.modifiers[i].operands[j]);
						this[rootNode.modifiers[i].type](exprVal);
					}
				}

				// set the rootNode to annotatedCommands, which the .go() method 
				// uses as the entry point to the automation
				this.annotatedCommands = rootNode;

				return this;
			}

			this.delegate = {};

			// rather than simply calling the passed in callbacks like we do for other events
			// we will wrap co-opt the event to perform some ui shenanigans
			this.delegate.commandMayExecute = function(payload) {

				// add class to any elements being targeted
				var elementLists = DependencyManager.getElements(payload.selectors);
				elementLists.forEach(function(list) {
					for(var i = 0, l = list.length;i < l;++i) {
						list[i].classList.add('flytrap-active-command');
					}
				});

				// continue up the callback chain
				if (options.commandMayExecute) options.commandMayExecute(payload);
			}

			this.delegate.commandDidComplete = function(payload) {
				
				// remove class to any elements being targeted
				if (payload.status !== 'spinning') {

					// find elements with our active class and remove the class
					var elements = document.getElementsByClassName('flytrap-active-command');
					for(var i = elements.length - 1;i >= 0;--i) {
						elements[i].classList.remove('flytrap-active-command');
					}
				}
				
				if (options.commandDidComplete) options.commandDidComplete(payload);
			}

			this.delegate.workflowDidComplete = options.workflowDidComplete;
			this.delegate.checkpointWasReached = options.checkpointWasReached;
			this.delegate.assertionDidComplete = options.assertionDidComplete;

			if (options.code == null)
				return;

			// search for dependencies under this context
			DependencyManager.setDOMContext(options.DOMContext);

			// parse the code via jison
			var parsedTree = TreeAnnotator.parse(options.code);

			// include information about referenced modules (if any) in the parsed result:
			// if no modules are referenced, the callback is executed immediately
			// if modules are referenced, we must obtain the module's code, etc., 
			// from the server, parse it, set any parameters, then add the
			// tree to ours as a sub-tree
			TreeAnnotator.attachModules(parsedTree, (function(parsedTreeWithModules) {

				// build our graph
				var annotatedTree = TreeAnnotator.buildTree(parsedTreeWithModules);

				// flytrap uses this info to start the workflow
				this.withCommandTree(annotatedTree);

			}).bind(this));

		}

		Flytrap.ExtractModuleReferences = function(script) {
			var result = [];
			var parsed = TreeAnnotator.parse(script);

			// dft the tree to find modules
			_extractModules(parsed.flytrap.statement_list, result);

			// private helper
			function _extractModules(nodes, result) {

				if (!nodes || !nodes.length) 
					return;

				// go through each child node
				for(var i = 0, l = nodes.length;i < l;++i) {

					var node = nodes[i];

					// add to result if it is a module node
					if (node.type === 'module' && node.module.name.expr_str) {

						// get the name of the module
						result.push(node.module.name.expr_str);
					}

					// recurse
					_extractModules(node.statement_list, result);
				}

			}

			return result;
		};	

		

		return Flytrap;
	}
);
