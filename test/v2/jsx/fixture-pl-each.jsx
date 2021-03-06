define(
	'test/fixture-pl-each', [
		'test/unittest',
		'core/flytrap'
	], 
	function(UnitTest, Flytrap) {
		function c() {
			return Array.prototype.slice.call(arguments).join('\n');
		}

	    return [
	    	
	    	<UnitTest title="Pl.each must iterate over an inline array" resolveAfter={3100} 
	    		getMarkup = {function() {
	    			var inputNodes = [1, 2, 3].map(function(n) {
	    				return <input type="button" id={'plEachClickTest' + n} />
	    			});

					return (<div>{inputNodes}</div>)
				}}
				
				run = {function() {
					new Flytrap({ 
						name: 'click test', 
						code: c(
							"flytrap 'test'",
							"each @id in ['#plEachClickTest1', '#plEachClickTest2', '#plEachClickTest3']",
							"begin",
								"click @id",
							"end"
						),
						commandDidComplete: (function(c) {
							if (c.status != 'executed') return;
							++this.clickCount;
						}).bind(this)
					}).go();
				}}

				clickCount = {0}

				getResult = {function() {
					return this.clickCount == 3;
				}
			}/>,

			<UnitTest title="Pl.each nested each w/ inline array" resolveAfter={9100} 
	    		getMarkup = {function() {
	    			var buttonNodes = ['a', 'b', 'c'].map(function(n) {
	    				return ['x', 'y', 'z'].map(function(m) {
	    					return <input type="button" id={n + m} />
	    				});
	    			});

					return (<div>{buttonNodes}</div>)
				}}
				
				run = {function() {
					new Flytrap({ 
						name: 'click test', 
						code: c(
							"flytrap 'test'",
							"each @a in ['a', 'b', 'c']",
							"begin",
								"each @x in ['x', 'y', 'z']",
								"begin",
									"click '#' + @a + @x",
								"end",
							"end"
						),
						commandDidComplete: (function(c) {
							if (c.status != 'executed') return;
							++this.clickCount;
						}).bind(this)
					}).go();
				}}

				clickCount = {0}

				getResult = {function() {
					return this.clickCount == 9;
				}
			}/>

	    ];
	}
);
