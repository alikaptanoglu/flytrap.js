define(
	'core/pl/nodes/_base', [
		'../../persister',
		'../modifier',
		'../nodeidgenerator'
	],
	function(LocalStoragePersister, Modifier, NodeIdGenerator) {

		

		var staticOrdinal = 0;

		// default node behavior
		var BaseNode = Object.create({
			parent: null,
			type: null,
			modifiers: [],
			variables: [],
			nodeId: 0,
			children: [],
			numberOfDependencyFulfillmentAttempts: 0,
			numberOfCompleteExecutions: 0,

			newId: function() { 
				this.nodeId = NodeIdGenerator.newId(); 
			},

			didExecute: function() {
			},

			shouldExecute: function() { 
				return false; 
			},

			childDidExecute: function(childNode) {
			},

			shouldEnterBlock: function() {
				return true;
			},

			reset: function() { 
				this.numberOfCompleteExecutions = 0; 
				this.numberOfDependencyFulfillmentAttempts = 0;
				this.persistControlFlowInfo();
			},

			persistControlFlowInfo: function() {
				LocalStoragePersister.persistNodeControlFlowInfo(this.getControlFlowInfo());
			},

			getCommand: function() { 
				return null; 
			},

			addModifiers: function(src, dst) {
				for(var i = 0, length = src.length;i < length;++i) {
					dst.push(new Modifier(src[i]));
				}
			},

			evaluateExpression: function(exprInfo) {
				switch (exprInfo.type) {
					case 'expr_str':
						return exprInfo.expr_str;
					case 'expr_var':
						return this.getVariableValue(exprInfo.expr_var.variableName);
					case 'expr_arr':
						return exprInfo.expr_arr;
					case 'expr_concat':
						var result = '';
						for(var i = 0, length = exprInfo.expr_concat.length;i < length;++i) {
							result += this.evaluateExpression(exprInfo.expr_concat[i]);
						}
						return result;
					case 'expr_obj':
						// build a real js object from our representation
						var result = {};
						for (var i = 0, length = exprInfo.expr_obj.props.length;i < length;++i) { 
							var p = exprInfo.expr_obj.props[i];
							result[this.evaluateExpression(p.key)] = this.evaluateExpression(p.value);
						}
						return result;
					case 'expr_dot':
						// start at the source
						var result = this.evaluateExpression(exprInfo.expr_dot.source);
						if (!result) return null;
						
						// walk down the dot chain
						for(var i = 0, length = exprInfo.expr_dot.keys.length;i < length;++i) {
							var k = exprInfo.expr_dot.keys[i];
							result = result[k];
						}
						return result;
					default:
						return exprInfo;
				}
			},

			getVariableValue: function(variableName) { 
				return this._getVariableValue(this, variableName); 
			},

			_getVariableValue: function(node, variableName) {
				if (!node) return null;

				// is this node an each with a iterable that is our variable?
				var itr_var = node.checkIterationVariable(variableName)
				if (itr_var) return itr_var;

				// check this node's variables
				if (node.variables) {
					for(var i = 0, length = node.variables.length;i < length;++i) {
						if (node.variables[i].key == variableName) {
							var value = node.variables[i].value;
							if (typeof value == 'string') {
								return value;
							}
							return this.evaluateExpression(value);
						}
					}
				}
				
				// recurse up the tree if we didn't find it
				var v = this._getVariableValue(node.parent, variableName);
				if (v) return this.evaluateExpression(v);

				return null;
			},	

			checkIterationVariable: function (variableName) {
				return null;
			},

			getAfterDelay: function() {
				for (var i = 0, length = this.modifiers.length;i < length;++i) {
					if (this.modifiers[i].type == 'afterSeconds') {
						return this.modifiers[i].operands[0] * 1000;
					}
				}
				return 1000;
			},

			getControlFlowInfo: function() {
				return { 
					nodeId: this.nodeId,
					nodeInfo: {
						numberOfDependencyFulfillmentAttempts: this.numberOfDependencyFulfillmentAttempts,
						numberOfCompleteExecutions: this.numberOfCompleteExecutions
					} 
				};
			},

			getModifiersPretty: function() {
				var descriptions = this.modifiers.map(function(modifier) {
		
					var operands = modifier.operands.map(function(op) {
						return "'" + this.evaluateExpression(op) + "'";
					}, this);

					return modifier.type + " " + operands.join(', ');
				}, this);

				return descriptions.join(";");
			},

			getSelectors: function() {
				var result = [];
				
				// iterate through modifiers
				this.modifiers.forEach(function(modifier) {

					// TODO: these if statements should probably be in an overridden getSelectors in statement.js
					if (modifier.type === 'log') return;
					if (modifier.type === 'value') {

						// skip each operand for value modifiers, to avoid sending the value as a selector
						for(var i = 0, l = modifier.operands.length;i < l;i += 2) {
							result.push(this.evaluateExpression(modifier.operands[i]))
						}

						return;
					}

					// and extract their operand values
					modifier.operands.forEach(function(op) {
						result.push(this.evaluateExpression(op));
					}, this);

				}, this);

				return result;
			},

			setControlFlowInfo: function(controlFlowInfo) {
				if (!controlFlowInfo) return;
				this.numberOfDependencyFulfillmentAttempts = controlFlowInfo.numberOfDependencyFulfillmentAttempts;
				this.numberOfCompleteExecutions = controlFlowInfo.numberOfCompleteExecutions;
			},

			// TODO: this should really be named setControlFlowInfoFromLocalStorage or something
			getAndSetControlFlowInfo: function() {
				var controlFlowInfo = LocalStoragePersister.getNodeControlFlowInfo(this.nodeId);
				this.setControlFlowInfo(controlFlowInfo);
			}			
		});

		

		return BaseNode;
	}
);
