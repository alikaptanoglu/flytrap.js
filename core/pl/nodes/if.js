define(
	'core/pl/nodes/if', [
		'../../command',
		'../nodefactory',
		'./_blockbase'
	],
	function(Command, NodeFactory, BaseBlockNode) {
		
		

		var APIfElseNode = function(ifInfo) {

			// set up basic info
			this.newId();
			this.numberOfDependencyFulfillmentAttempts = 0;
			this.hasEvaluatedConditional = false;
			this.conditionalDidEvaluateToTrue = false;
			this.comparable = ifInfo.comparable;

			// create and add children nodes from our then and else blocks
			this.children = [];
			this.ifChildren = [];
			this.elseChildren = [];
			this.addChildren(ifInfo.then_statements, this.ifChildren);
			this.addChildren(ifInfo.else_statements || [], this.elseChildren);

			// build our list of variables
			this.variables = [];
			this.ifVariables = [];
			this.elseVariables = [];
			this.addVariables(ifInfo.then_statements, this.ifVariables);
			this.addVariables(ifInfo.else_statements, this.elseVariables);

			// populate modifiers
			this.modifiers = [];
			if (ifInfo.modifiers) {
				this.addModifiers(ifInfo.modifiers, this.modifiers);
			}

			// override
			this.shouldExecute = function() {
				return !this.hasEvaluatedConditional;
			};

			// if there is a conditional dependency (if exists '#x' antidependency '#anti' ...)
			// we must wait until that dependency is fulfilled, thus it is treated like a regular command node.

			// override
			this.getCommand = function() {

				// evaluate our parameters to pass to our deferred callback
				var evaluatedOperands = [this.comparable.type];
				for(var i = 0;i < this.comparable[this.comparable.type].operands.length;++i) {
					evaluatedOperands.push(this.evaluateExpression(this.comparable[this.comparable.type].operands[i]));
				}

				// create command with our evaluated operands as parameters
				var command = new Command({ name: this.comparable.type + ' ' + JSON.stringify(evaluatedOperands) });
				for(var i = 0;i < evaluatedOperands.length;++i) {
					command.withParameter(evaluatedOperands[i]);
				}

				// build a command with (anti/)dependencies (if any)
				for(var i = 0;i < this.modifiers.length;++i) {
					for(var j = 0;j < this.modifiers[i].operands.length;++j) {
						command[this.modifiers[i].type](this.evaluateExpression(this.modifiers[i].operands[j]));
					}
				}

				// when the command's dependencies are fulfilled, the following callback will be executed
				// and we set our children depending on the result of evaluation
				command.withCallback((function(type, op1, op2) {
					var c = new Command('if ' + type + ' ' + op1);
					c[type](op1, op2);
					this.conditionalDidEvaluateToTrue = c.execute();
					this.children = this.conditionalDidEvaluateToTrue ? this.ifChildren : this.elseChildren;
					this.variables = this.conditionalDidEvaluateToTrue ? this.ifVariables : this.elseVariables;
					this.hasEvaluatedConditional = true;
				}).bind(this));

				// set the command's fulfillment attempts so it is correct across page refreshes
				command.numFulfillAttempts = this.numberOfDependencyFulfillmentAttempts;

				return command;
			};

			// override 
			this.reset = function() {
				APIfElseNode.prototype.reset.call(this);
				this.hasEvaluatedConditional = false;
				this.conditionalDidEvaluateToTrue = false;
				this.resetChildren();
				this.persistControlFlowInfo();
			};

			// override
			this.childDidExecute = function(childNode) {
				if (childNode == this.children[this.children.length - 1]) {
					this.parent.childDidExecute(this);
				}
				this.persistControlFlowInfo();
			}

			// override
			this.getControlFlowInfo = function() {
				var baseInfo = APIfElseNode.prototype.getControlFlowInfo.call(this);
				baseInfo.nodeInfo.hasEvaluatedConditional = this.hasEvaluatedConditional;
				baseInfo.nodeInfo.conditionalDidEvaluateToTrue = this.conditionalDidEvaluateToTrue;
				return baseInfo;
			}

			// override
			this.setControlFlowInfo = function(controlFlowInfo) {
				if (!controlFlowInfo) return;
				APIfElseNode.prototype.setControlFlowInfo.call(this, controlFlowInfo);
				this.hasEvaluatedConditional = controlFlowInfo.hasEvaluatedConditional;
				this.conditionalDidEvaluateToTrue = controlFlowInfo.conditionalDidEvaluateToTrue;
			}

			// override
			this.resetChildren = function() {
				for(var i = 0;i < this.ifChildren.length;++i) {
					this.ifChildren[i].reset();
				}

				for(var i = 0;i < this.elseChildren.length;++i) {
					this.elseChildren[i].reset();
				}
			}

			// get our control-flow info from localstorage
			this.getAndSetControlFlowInfo();
		};

		APIfElseNode.prototype = BaseBlockNode;
		NodeFactory.if = APIfElseNode;

		

		return APIfElseNode;
	}
);
