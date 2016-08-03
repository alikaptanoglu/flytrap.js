define(
	'core/persister',
	[],
	function() {

		

		LocalStoragePersister = {};
		var sessionPre = "_flytrapP_",
			sessionKeys = {
				currentWorkflow: sessionPre + "CurrentWorkflow",
				currentCode: sessionPre + "CurrentCode"
			};

		LocalStoragePersister.getCurrentWorkflow = function() {
			return sessionStorage.getItem(sessionKeys.currentWorkflow);
		};
		LocalStoragePersister.setCurrentWorkflow = function(workflowName) {
			sessionStorage.setItem(sessionKeys.currentWorkflow, workflowName);
		};

		LocalStoragePersister.persistNodeControlFlowInfo = function(controlFlowInfo) {
			var key = controlFlowInfo.nodeId;
			var value = JSON.stringify(controlFlowInfo.nodeInfo);
			sessionStorage.setItem(sessionPre + key, value);
		};

		LocalStoragePersister.getNodeControlFlowInfo = function(nodeId) {
			var value = sessionStorage.getItem(sessionPre + nodeId);

			return JSON.parse(value);
		};

		LocalStoragePersister.setCurrentWorkflowCode = function(code) {
			sessionStorage.setItem(sessionKeys.currentCode, code);
		};

		LocalStoragePersister.getCurrentWorkflowCode = function() {
			return sessionStorage.getItem(sessionKeys.currentCode);
		};

		LocalStoragePersister.clearKeys = function() {
			for(var x in sessionStorage) 
				if (sessionStorage.hasOwnProperty(x) && x.indexOf(sessionPre) === 0)
					sessionStorage.removeItem(x);
		};

		if(typeof(Storage) == "undefined") {
		    throw 'no local storage support';
		}

		

		return LocalStoragePersister;
	}
);
