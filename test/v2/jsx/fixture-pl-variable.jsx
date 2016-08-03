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
	    	
	    	<UnitTest title="Pl.variable must resolve value" resolveAfter={1100}
	    		getMarkup = {function() {
					return (<div><input type="button" id="plVarTest1" onClick={this.markAsPassed} /></div>)
				}}
				
				run = {function() {
					new Flytrap({ 
						name: 'variable test', 
						code: c(
							"flytrap 'test'",
							"@buttonId = '#plVarTest1'",
							"click @buttonId"
						)}).go();
				}
			}/>

	    ];
	}
);
