define(
	'test/fixture-pl-variable', [
		'test/unittest',
		'core/flytrap'
	], 
	function(UnitTest, Flytrap) {
		function c() {
			return Array.prototype.slice.call(arguments).join('\n');
		}

	    return [
	    	
	    	React.createElement(UnitTest, {title: "Pl.variable must resolve value", resolveAfter: 1100, 
	    		getMarkup: function() {
					return (React.createElement("div", null, React.createElement("input", {type: "button", id: "plVarTest1", onClick: this.markAsPassed})))
				}, 
				
				run: function() {
					new Flytrap({ 
						name: 'variable test', 
						code: c(
							"flytrap 'test'",
							"@buttonId = '#plVarTest1'",
							"click @buttonId"
						)}).go();
				}
			})

	    ];
	}
);
