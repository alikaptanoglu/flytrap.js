define(
	'core/pl/nodes/each', [
		'../../persister',
		'../nodefactory',
		'./_blockbase'
	],
	function(LocalStoragePersister, NodeFactory, BaseBlockNode) {

		

		var APEachNode = function(eachInfo) {

			// set up basic info
			this.newId();
			this.iterator_var_name = eachInfo.iterator_var_name;
			this.iterator_expr = eachInfo.iterator_expr;
			this.numberOfCompleteExecutions = 0;
			this.numberOfDependencyFulfillmentAttempts = 0;

			// create and add children nodes
			this.children = [];
			this.addChildren(eachInfo.statement_list, this.children);

			// set our variables
			this.addVariables(eachInfo.statement_list);

			// override base reset to also reset all children nodes
			this.reset = function() {
				this.numberOfCompleteExecutions = 0;
				this.resetChildren();
				this.persistControlFlowInfo();
			};

			// called when a child statement has fully completed its execution
			// an each will only call its parent's childDidExecute method once: at the very end of its final iteration
			this.childDidExecute = function(childNode) {

				// is this the last child in our list?
				if (childNode == this.children[this.children.length - 1]) {
					
					// check to see if we have any iterations left
					var items = this.evaluateExpression(this.iterator_expr);
					if (items && ++this.numberOfCompleteExecutions < items.length) {
						this.resetChildren();
					}
					// if not, signal our parent that we've completed execution
					else {
						this.parent.childDidExecute(this);
					}
				}

				// send controlflow info to localstorage
				this.persistControlFlowInfo();
			};

			// override
			this.shouldEnterBlock = function() {
				
				// only enter the block if we have a valid iterable
				var items = this.evaluateExpression(this.iterator_expr);
				return items && items.length;
			};

			// override
			this.checkIterationVariable = function(variableName) {

				// if our var name for the iterable matches the desired one, get its value
				if (this.iterator_var_name == variableName) {

					// the iterable is a variable, so recurse up
					if (this.iterator_expr.type == 'expr_var') {
						var v = this._getVariableValue(this.parent, this.iterator_expr.expr_var.variableName);
						if (!v) return null;
						if (typeof v != 'object' || !v.length) throw new 'invalid array for iterator';
						return v[this.numberOfCompleteExecutions];
					}

					// the iterable is an in-line array
					else if (this.iterator_expr.type == 'expr_arr') {
						return this.iterator_expr.expr_arr[this.numberOfCompleteExecutions];
					}

					// the iterable is object w/ dot notation
					else if (this.iterator_expr.type == 'expr_dot') {
						
						// get the source object
						var v = this._getVariableValue(this.parent, this.iterator_expr.expr_dot.source.expr_var.variableName);

						if (!v) {
							console.log('attempting to access undefined property ' + variableName);
							return null;
						}

						// walk down the dot chain
						for(var i = 0, l = this.iterator_expr.expr_dot.keys.length;i < l;++i) {
							var k = this.iterator_expr.expr_dot.keys[i];
							var foundProp = false;
							// two situations can arise here and they all happen if the dot-chain has more than 1 dot (i don't know if this is correct?)

							// (a) is that the iterator variable is a dot object (like "each @name in car.driver.childrenNames")
							// in which case we must traverse its "props" property for a matching keyname
							if (!v[k] && v.type && v[v.type].props) {

								for(var ii = 0, ll = v[v.type].props.length;ii < ll;++ii) {
									if (v.type && v[v.type].props[ii].key.expr_str === k) {
										v = v[v.type].props[ii].value;
										foundProp = true;
										continue;
									}
								}

								if (!foundProp) {
									//debugger;
									console.log('attempting to access undefined property "' + k + '" for iterator variable "' + variableName + '"');
									return null;
								}

								foundProp = false;
							}

							// and this is (b) which probably happens for other reasons
							else {
								v = v[k];
							}
						}

						// if the end result is an expression of type array, we must 
						if (v.type === 'expr_arr') {
							v = this.evaluateExpression(v);
						}

						// return the value 
						return this.evaluateExpression(v[this.numberOfCompleteExecutions]);
					}

					// if we're here, the iterable is not valid
					throw 'invalid iterable';
				}
			}

			// get our control-flow info from localstorage
			this.getAndSetControlFlowInfo();
		};

		APEachNode.prototype = BaseBlockNode;
		NodeFactory.each = APEachNode;
		
		

		return APEachNode;
	}
);
