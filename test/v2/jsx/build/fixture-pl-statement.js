define(
	'test/fixture-pl-statement', [
		'test/unittest',
		'core/flytrap'
	], 
	function(UnitTest, Flytrap) {
	    return [
	    	
	    	React.createElement(UnitTest, {title: "Pl.statement click must click the button", resolveAfter: 1100, 
	    		getMarkup: function() {
					return React.createElement("input", {type: "button", id: "plStatementClickTest1", onClick: this.markAsPassed})
				}, 

				run: function() {
					var code = "" +

					"flytrap 'test'" +
					"click '#plStatementClickTest1'";

					new Flytrap({ name: 'click test', code: code }).go();
				}
			}),


			React.createElement(UnitTest, {title: "Pl.statement hash must change the hash", resolveAfter: 1100, 
	    		getResult: function() {
					return window.location.hash == '#plhashtest';
				}, 

				run: function() {
					var code = "" +

					"flytrap 'test'" +
					"hash '#plhashtest'";

					new Flytrap({ name: 'hash test', code: code }).go();
				}
			}),


			React.createElement(UnitTest, {title: "Pl.statement check must check the box", resolveAfter: 1100, 
	    		getMarkup: function() {
					return React.createElement("input", {type: "checkbox", id: "plStatementCheckTest1", onChange: this.markAsPassed})
				}, 

				run: function() {
					var code = "" +

					"flytrap 'test'" +
					"check '#plStatementCheckTest1'";

					new Flytrap({ name: 'check test', code: code }).go();
				}
			}),


			React.createElement(UnitTest, {title: "Pl.statement uncheck must uncheck the box", resolveAfter: 1100, 
	    		getMarkup: function() {
					return React.createElement("input", {type: "checkbox", id: "plStatementUncheckTest1", checked: "checked", onChange: this.markAsPassed})
				}, 

				run: function() {
					var code = "" +

					"flytrap 'test'" +
					"check '#plStatementUncheckTest1'";

					new Flytrap({ name: 'uncheck test', code: code }).go();
				}
			}),


			React.createElement(UnitTest, {title: "Pl.statement value must set the value 1", resolveAfter: 1100, 
	    		getMarkup: function() {
					return React.createElement("input", {type: "text", id: "plStatementValueTest1"})
				}, 

				getResult: function() {
					return document.getElementById('plStatementValueTest1').value == 'success! 12345';
				}, 

				run: function() {
					var code = "" +

					"flytrap 'test'" +
					"value '#plStatementValueTest1', 'success! 12345'";

					new Flytrap({ name: 'value test 1', code: code }).go();
				}
			}),


			React.createElement(UnitTest, {title: "Pl.statement value must set the value 2", resolveAfter: 1100, 
	    		getMarkup: function() {
					return React.createElement("input", {type: "text", id: "plStatementValueTest2"})
				}, 

				getResult: function() {
					return document.getElementById('plStatementValueTest2').value == 'success! 12345';
				}, 

				run: function() {
					var code = "" +

					"flytrap 'test'" +
					"set '#plStatementValueTest2' to 'success! 12345'";

					new Flytrap({ name: 'value test 2', code: code }).go();
				}
			}),


			React.createElement(UnitTest, {title: "Pl.statement focus must focus on input", resolveAfter: 1100, 
	    		getMarkup: function() {
					return React.createElement("input", {type: "text", id: "plStatementFocusTest1", onFocus: this.markAsPassed})
				}, 

				run: function() {
					var code = "" +

					"flytrap 'test'" +
					"focus '#plStatementFocusTest1'";

					new Flytrap({ name: 'focus test', code: code }).go();
				}
			})

	    ];
	}
);
