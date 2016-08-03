define(
	'core/pl/nodes/module', [
		'../../persister',
		'../nodefactory',
		'./_blockbase'
	],
	function(LocalStoragePersister, NodeFactory, BaseBlockNode) {

		

		var ModuleNode = function(moduleInfo) {

			// set up basic info
			this.newId();
			this.numberOfDependencyFulfillmentAttempts = 0;
			this.inputs = moduleInfo.inputs;

			// create and add children nodes
			this.children = [];
			this.addChildren(moduleInfo.parsed.flytrap.statement_list, this.children);

			// set our variables
			// override
			this.addVariables = function(infos) {
				
				// call the base method
				ModuleNode.prototype.addVariables.call(this, infos);

				if (!this.inputs) return;

				// TODO:
				// for now, this only checks one level deep in the tree
				// for variables.  ie, if the caller wants to override a variable
				// that is inside an each statement in the module script,
				// this won't work
				// we will have to traverse the tree and update variables recursively

				// now override any variables set by a "with 'x' as '@y'" statement
				this.inputs.forEach(function(moduleInput) {
				
					// check each variable
					for(var i = 0, l = this.variables.length;i < l;++i) {

						// find the variable of the same name
						if (this.variables[i].key === moduleInput.variable) {

							// and replace the value
							this.variables[i].value.expr_str = moduleInput.value.expr_str;
							break;
						}
					}

				}, this);

			}

			// call the overridden version
			this.addVariables(moduleInfo.parsed.flytrap.statement_list);

			// act as if this node has already executed
			this.numberOfCompleteExecutions = 1;

			// override
			this.reset = function() {}
		};

		ModuleNode.prototype = BaseBlockNode;
		NodeFactory.module = ModuleNode;
		
		

		return ModuleNode;
	}
);
