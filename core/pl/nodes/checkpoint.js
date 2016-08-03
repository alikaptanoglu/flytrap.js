define(
	'core/pl/nodes/checkpoint', [
		'./_checkpointbase',
		'../nodefactory'
	],
	function(CheckpointBaseNode, NodeFactory) {

		

		var CheckpointNode = function(checkpointInfo) {

			// set up basic info
			this.newId();
			this.type = 'checkpoint';
			this.checkpointInfo = checkpointInfo;

			this.getCheckpointDescription = function() {
				return this.evaluateExpression(this.checkpointInfo);
			}

			// get our control-flow info from localstorage
			this.getAndSetControlFlowInfo();
		};

		CheckpointNode.prototype = CheckpointBaseNode;
		NodeFactory.checkpoint = CheckpointNode;

		

		return CheckpointNode;
	}
);
