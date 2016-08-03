define(
	'core/pl/nodes/statement', [
		'../../command',
		'../nodefactory',
		'./_base'
	],
	function(Command, NodeFactory, BaseNode) {

		

		var StatementNode = function(stmtNode) {

			// set up basic info
			this.newId();
			this.title = this.evaluateExpression(stmtNode.command);
			this.numberOfDependencyFulfillmentAttempts = 0;
			this.numberOfCompleteExecutions = 0;
			this.variables = [];
			this.modifiers = [];
			this.addModifiers(stmtNode.modifiers, this.modifiers);

			// override
			this.shouldExecute = function() { 

				// if we have a "repeat n times" modifier, account for it
				for(var i = 0, l = this.modifiers.length;i < l;++i) {
					if (this.modifiers[i].type !== 'repeat') continue;
					return this.numberOfCompleteExecutions - this.evaluateExpression(this.modifiers[i].operands[0]) - 1;
				}

				// otherwise, execute if we have not completed an execution
				return !this.numberOfCompleteExecutions;
			};

			// override
			this.getCommand = function() {
				var command = new Command({name: this.title});
				for(var i = 0;i < this.modifiers.length;++i) {
					switch (this.modifiers[i].type) {
						case 'value':
							if (this.modifiers[i].operands.length != 2) 
								throw 'invalid assignment, 2 operands required, not ' + this.modifiers[i].operands.length;

							var operandValues = [];
							for(var j = 0;j < this.modifiers[i].operands.length;++j) {
								var value = this.evaluateExpression(this.modifiers[i].operands[j]);
								operandValues.push(value);
							}
							command.value.apply(command, operandValues);
							break;
						case 'goto':
							if (this.modifiers[i].operands.length > 1) 
								throw 'invalid goto statement, 1 operand required, not ' + this.modifiers[i].operands.length;
							command.goto.call(command, this.evaluateExpression(this.modifiers[i].operands[0]));
							break;
						case 'repeat': 	// repeat is computed on the fly (ctrl+f .shouldExecute)
							if (this.modifiers[i].operands.length > 1) 
								throw 'invalid repeat statement, 1 operand required, not ' + this.modifiers[i].operands.length;
							break;
						default:
							for(var j = 0;j < this.modifiers[i].operands.length;++j) {
								var value = this.evaluateExpression(this.modifiers[i].operands[j]);
								command[this.modifiers[i].type](value);	
							}
					}
				}

				command.numFulfillAttempts = this.numberOfDependencyFulfillmentAttempts;

				return command;
			};

			// override
			this.didExecute = function() {
				++this.numberOfCompleteExecutions;
				this.parent.childDidExecute(this);
				this.persistControlFlowInfo();
			};

			// get our control-flow info from localstorage
			this.getAndSetControlFlowInfo();
		};

		StatementNode.prototype = BaseNode;
		NodeFactory.command = StatementNode;
		
		

		return StatementNode;
	}
);
