define(
	'core/timer',
	[],
	function() {

		

		var Timer = function(_interval, callback) {
			var timeout;
			this.interval = _interval;
			this.callback = callback;

			this.start = function() {
				this.stop();
				timeout = setTimeout(this.callback, this.interval);
			};
			this.stop = function() {
				clearTimeout(timeout);
			};
		}

		

		return Timer;
	}
);
