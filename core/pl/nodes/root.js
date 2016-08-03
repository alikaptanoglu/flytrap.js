define(
	'core/pl/nodes/root', [
		'./_blockbase',
		'./statement',
		'./each',
		'./if',
		'./checkpoint',
		'./assert',
		'./module'
	],
	function(BaseBlockNode) {

		

		var RootNode = function(flytrapInfo) {

			// set up basic info
			this.newId();

			// populate modifiers
			this.modifiers = [];
			this.addModifiers(flytrapInfo.options, this.modifiers);

			// build list of children
			this.children = [];
			this.addChildren(flytrapInfo.statement_list, this.children);

			// build our list of variables
			this.addVariables(flytrapInfo.statement_list);

			// act as if this node has already executed
			this.numberOfCompleteExecutions = 1;

			// override
			this.reset = function() {}
		};

		RootNode.prototype = BaseBlockNode

		

		return RootNode;
	}
);
