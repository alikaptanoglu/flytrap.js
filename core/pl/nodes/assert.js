define(
	'core/pl/nodes/assert', [
		'./_checkpointbase',
		'../nodefactory',
		'../../command'
	],
	function(CheckpointBaseNode, NodeFactory, Command) {

		

		var AssertNode = function(assertInfo) {

			// set up basic info
			this.newId();
			this.type = 'assert';
			this.assertInfo = assertInfo;

			this.getModifiersPretty = function() {
				var result = this.getAssertionResult();
				return result.description;
			}
			
			this.getAssertionResult = function() {
				// build a csv string of the operand values
				var evaluatedOperands = this.assertInfo.comparable[this.assertInfo.comparable.type].operands.map(function(op_expr) {
					return this.evaluateExpression(op_expr);
				}, this);

				var fullDesc = this.assertInfo.comparable.type + ' ' + evaluatedOperands.map(function(op) { return "'" + op + "'" }).join(', ');

				// build and execute the command that will take care of our assertion eval
				var c = new Command({name: 'asserting ' + fullDesc });
				c[this.assertInfo.comparable.type].apply(c, evaluatedOperands);
				return { result: c.execute(), type: this.assertInfo.comparable.type, description: fullDesc };
			}

			// get our control-flow info from localstorage
			this.getAndSetControlFlowInfo();
		};

		AssertNode.prototype = CheckpointBaseNode;
		NodeFactory.assert = AssertNode;

		

		return AssertNode;
	}
);
