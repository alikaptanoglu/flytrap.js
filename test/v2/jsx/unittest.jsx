define(
	'test/unittest', [],
	function() {
		return React.createClass({
			getInitialState: function() {
				return { status: 'incomplete' };
			},

			componentWillMount: function() {
				this.setUpDefaultBehavior();
			},

			componentDidMount: function() {
				this.runTest();
			},

		  	render: function() {
			    return (
			      	<div className={this.state.status + ' test-node'}>
			      		<span>{this.props.title}</span>
			      		<div style={{visibility: this.state.status == 'incomplete' ? 'visible' : 'hidden', position: 'relative'}}>
			        		{this.props.getMarkup.call(this)}
			        	</div>
			      	</div>
			    );
		  	},

		  	defaultResolveAfter: 100,

		  	resolveTimeout: null,

		  	runTest: function() {
		  		this.setResolveTimeout();
		  		this.props.run();
		  	},

		  	markAsPassed: function() {
		  		this.clearResolveTimeout();
		  		if (this.state.status != 'incomplete') {
		  			console.log(this.props.title + ': the success trigger was fired, but the result of the test was already ' + this.state.status + '.  Is resolveAfter high enough?');
		  			return;
		  		}
		  		this.setState({ status: "passed" });
		  		console.log(this.props.title + ' ... Passed!');
		  	},

		  	markAsFailed: function() {
		  		this.clearResolveTimeout();
		  		this.setState({ status: "failure" });
		  		console.log(this.props.title + ' ... Failed!');
		  	},

		  	setUpDefaultBehavior: function() {
				if (!this.props.title) this.props.title = 'Test';
				if (!this.props.getResult) this.props.getResult = function() { return false; };
				if (!this.props.getMarkup) this.props.getMarkup = function() { return null; };
				if (!this.props.run) this.props.run = function() {};
			},

		  	setResolveTimeout: function() {
		  		this.resolveTimeout = setTimeout((function() {
		  			this.resolve();
		  		}).bind(this), this.props.resolveAfter || this.defaultResolveAfter);
		  	},

		  	clearResolveTimeout: function() {
		  		clearTimeout(this.resolveTimeout);
		  		this.resolveTimeout = null;
		  	},

		  	resolve: function() {
		  		this.props.getResult() ? this.markAsPassed() : this.markAsFailed();
		  	}
		});
	}
);
