define(
	'core/pl/nodes/_blockbase', [
		'./_base',
		'../nodefactory'
	],
	function(BaseNode, NodeFactory) {

		

		// adds prototype behavior for IfElseNode and EachNode.
		var BaseBlockNode = (function() {

			// calls each child's reset method
			this.resetChildren = function() {
				for(var i = 0;i < this.children.length;++i) {
					this.children[i].reset();
				}
			}

			// base method used to add children nodes
			this.addChildren = function(src, dest) {
					
				// map from src to dest
				for(var i = 0;i < src.length;++i) {
					var child = this.createChildNode(src[i]);
					if (!child) {
						continue;	// this means it was an assignment, for which no node is needed
					}

					// connect child to parent and add child to destination array
					child.parent = this;
					dest.push(child);
				}
			}

			// block nodes (if, each) add children via this method.
			this.createChildNode = function(node) {

				// guard against assignments being passed in
				if (!NodeFactory[node.type]) {
					return null;
				}
			
				// build our node from the node factory
				return new NodeFactory[node.type](node[node.type]);
			}

			this.addVariables = function(infos, dest) {

				if (!infos) return;
				
				// create a variable list if we don't have one
				if(!this.variables)
					this.variables = [];

				// use the destination array object if passed in, if not, just use the normal this.variables
				if (!dest)
					dest = this.variables;

				// add each assignment to a list held by this node
				infos.forEach(function(node) {
				
					// guard against non-assignments
					if (node.type !== 'assignment') 
						return;

					// check for the existence of a same-name variable
					var existingAssignments = dest.filter(function(existing) { 
						return existing.key === node.assignment.variable; 
					})

					// if one exists, just update the value
					if (existingAssignments.length === 1) {
						existingAssignments[0].value = node.assignment.value;
					}
					else {
						dest.push({ key: node.assignment.variable, value: node.assignment.value });
					}

				}, this);

			}

			return this;

		}).call(Object.create(BaseNode));

		

		

		return BaseBlockNode;
	}
);
