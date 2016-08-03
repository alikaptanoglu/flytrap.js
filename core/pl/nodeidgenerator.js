define(
	'core/pl/nodeidgenerator', [],
	function() {

		

		function _NodeIdGenerator() {
			this.ordinal = 0;
		}

		// set up the generator's prototype
		var NodeIdGenerator = (function() {
			
			// called by all nodes
			this.prototype.newId = function() {
				return this.ordinal++;
			}

			// called at the beginning of every workflow
			this.prototype.reset = function() {
				this.ordinal = 0;	
			}

			// singleton
			return new this;

		// execute bound w/ generator
		}).call(_NodeIdGenerator);

		

		return NodeIdGenerator;
	}
);
