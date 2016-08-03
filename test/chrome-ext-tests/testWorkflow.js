define(
	'chrome-ext-test', [ 
		'jquery',
		'core/flytrap' 
	],
	function($, Flytrap) {
		var ky = new Flytrap({name:'Chrome Extension Test'});
		ky.do().each(['A', 'B', 'C'], function(val) {
			ky.perform('click button ' + val)
				.click('input[type=button][value=' + val + ']');
		});
		return ky;
	}
);
