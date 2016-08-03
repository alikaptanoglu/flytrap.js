define(
	'test/fixture-command', [
		'test/unittest',
		'core/command'
	], 
	function(UnitTest, Command) {
	    return [
	    	
	    	<UnitTest title="Command.click must click button" resolveAfter={100} 
	    		getMarkup = {function() {
					return <input type="button" id="clickTest1" onClick={this.markAsPassed} />
				}} 

				run = {function() {
					var c = new Command({ name: 'click test' });
					c.click('#clickTest1');
					c.execute();
				}
			}/>,


	    	<UnitTest title="Command.hash must change the hash" 
	    		run = {function() {
					var c = new Command({ name: 'hash test' });
					c.hash('#helloimjohnnyhash');
					c.execute();
				}}

				getResult = {function() {
					return window.location.hash == '#helloimjohnnyhash';
				}
			}/>,


	    	<UnitTest title="Command.check must check the box" 
	    		getMarkup = {function() {
					return <input type="checkbox" id="checkTest1" onChange={this.markAsPassed} />
				}} 

				run = {function() {
					var c = new Command({ name: 'check test' });
					c.check('#checkTest1');
					c.execute();
				}
			}/>,


	    	<UnitTest title="Command.uncheck must uncheck the box" 
	    		getMarkup = {function() {
					return <input type="checkbox" id="uncheckTest1" checked="checked" onChange={this.markAsPassed} />
				}} 

				run = {function() {
					var c = new Command({ name: 'uncheck test' });
					c.uncheck('#uncheckTest1');
					c.execute();
				}
			}/>,


	    	<UnitTest title="Command.value must set value"
	    		getMarkup = {function() {
					return <input type="text" id="valueTest1" />
				}} 

				run = {function() {
					var c = new Command({ name: 'value test' });
					c.value('#valueTest1', 'success!');
					c.execute();
				}} 

				getResult = {function() {
					return document.getElementById('valueTest1').value == 'success!';
				}
			}/>,


	    	<UnitTest title="Command.focus must focus on input" 
	    		getMarkup={function() {
					return <input type="text" id="focusTest1" onFocus={this.markAsPassed} />
				}} 

				run = {function() {
					var c = new Command({ name: 'focus test' });
					c.focus('#focusTest1');
					c.execute();
				}
			}/>

	    ];
	}
);
