define(
	'bootstrapper', [
		'lib/output.min'
	],
	function(Flytrap) {

		

		var Bootstrapper = {
			workflowDictionary: {}
		}

		Bootstrapper.startWorkflow = function(workflowName) {
			Bootstrapper.workflowDictionary[workflowName].go();
		}

		Bootstrapper.startOrResumeWorkflow = function(workflowName, workflowCode) {
			new Flytrap({name: workflowName, code: workflowCode}).go();
		}

		Bootstrapper.registerWorkflow = function(workflow) {
			Bootstrapper.workflowDictionary[workflow.name] = workflow;
		}

		

		return Bootstrapper;
	}
);
