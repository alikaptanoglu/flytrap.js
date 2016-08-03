var require = {
    deps: [ 
    	"bootstrapper",
    	"core/persister"
    ],

    // init method
    callback: function(Bootstrapper, Persister) {

    	// should we resume a current workflow?
    	var currentFlow = Persister.getCurrentWorkflowCode();
    	if (currentFlow){
    		Bootstrapper.startOrResumeWorkflow('custom', currentFlow);
    	}

    	// message receiver function
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

			// the popup has sent a message to run a workflow
			if (request.workflow == 'custom') {
				try {

					// set the code as our current workflow so we can resume it upon page reload
					Persister.setCurrentWorkflowCode(request.code);

					// use the bootstrapper service to start/resume the workflow after a reload
					Bootstrapper.startOrResumeWorkflow(request.workflow, request.code);
				} catch (e) {

					// log the error and rethrow
					console.log('uh oh: ' + e.message);
					throw e.message;
				}
			}
			else {
				// does this ever happen?
				console.log('HEY IF YOU SEE THIS EVER LMK')
				Bootstrapper.startWorkflow(request.workflow);
			}
		});
    }
};
