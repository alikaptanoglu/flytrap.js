define(
	'core/pl/nodes/_checkpointbase', [
		'./_base'
	],
	function(BaseNode) {

		

		// adds prototype behavior for CheckpointNode and AssertNode
		var CheckpointBaseNode = (function() {
			
			// override
			this.shouldExecute = function() {
				return !this.numberOfCompleteExecutions;
			}

			// override
			this.didExecute = function() {
				++this.numberOfCompleteExecutions;
				this.parent.childDidExecute(this);
				this.persistControlFlowInfo();
			};

			return this;

		// inherit from BaseNode
		}).call(Object.create(BaseNode))

		

		return CheckpointBaseNode;
	}
);
