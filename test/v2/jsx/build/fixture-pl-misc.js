define(
	'test/fixture-pl-misc', [
		'test/unittest'
	], 
	function(UnitTest) {
		function c() {
			return Array.prototype.slice.call(arguments).join('\n');
		}

	    return [
	    	
	    	React.createElement(UnitTest, {title: "Pl.goto must change the URL", 
				
				run: function() {
					new Flytrap({ 
						name: 'goto test', 
						code: c(
							"flytrap 'test'",
							"goto 'http://google.com'"
						)}).go();
				}
			})

	    ];
	}
);
