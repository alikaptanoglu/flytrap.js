define(
	'core/pl/modifier', [],
	function() {

		

		var Modifier = function(modifierNode){
			this.type = modifierNode.type;
			this.operands = modifierNode.operands;
		};

		

		return Modifier;
	}
);
