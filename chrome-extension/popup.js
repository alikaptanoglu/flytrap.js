/* 
 * Copyright (c) 2015
 * William Gardner
 */

///
/// INIT
///

window.addEventListener('DOMContentLoaded', function domContentLoaded() {

	//</api-url>
	var _BASEURL = "http://flytrap.dev:3000/api";
	//</api-url>

	// instantiate services

	var api = new ApiService(_BASEURL);
	var storage = new StorageService();

	// get any testsuites this user has
	api.testsuites.getAll(function(testsuites) {
		var select = H.id('testsuites');

		// populate testsuites dropdown on the saved tab
		testsuites.forEach(function(testsuite) {
			select.add(H.option(testsuite.name, testsuite.id));
		});
	});

	// populate textarea with saved scratchpad script
	if (chrome.storage) {

		//chrome.storage.local.get('scratchpadScript', function(value) {
		//	H.id('scratchpadScriptText').value = value.scratchpadScript || '';
	    //});
	    //chrome.storage.local.get('scratchpadName', function(value) {
		//	H.id('offline-name').value = value.scratchpadName || '';
	    //});

	    storage.get('offline-workflows', function(workflows) {

	    	// format workflows so that Scratchpad is always the default top option
	    	workflows = workflows || [{ name: 'Scratchpad', script: H.id('scratchpadScriptText').value, selected: true }];

	    	// grab the select element
			var select = H.id('offline-list');

			// disable and clear out the options
			for(var i = select.options.length - 1;i > 0;--i)
				select.remove(i)

			// add options
			workflows.forEach(function(w) {

				// add options to the select 
				select.add(H.option(w.name, w.name));

				// mark as selected if needed
				if (w.selected) {
					select.value = w.name;
					H.id('offline-name').value = w.name;
					H.id('scratchpadScriptText').value = w.script;

					// if the current workflow is "Scratchpad", hide the delete link
 					if (w.name === "Scratchpad") {
						H.id('delete-link').style.display = "none";
					}
				}
			});
			
	    });
	}

	H.id('offline-list').addEventListener('change', function(e) {
		var select = e.target;

		var option = select.selectedOptions[0].value;
		storage.get('offline-workflows', function(results) {
			for(var i = 0, l = results.length;i < l;++i) {
				if (results[i].name !== option) {
					delete results[i].selected;
					continue;
				}

				results[i].selected = true;
				H.id('offline-name').value = results[i].name;
				H.id('scratchpadScriptText').value = results[i].script;

				// if the current workflow is "Scratchpad", hide the delete link
				H.id('delete-link').style.display = results[i].name === "Scratchpad" ? "none" : "";				
			}

			// reset our workflows with the updated selected flags
			storage.set({ "offline-workflows": results });
		});
	});

	// click event on the Scratchpad Run button
	H.id('scratchpadRun').addEventListener('click', function() {
		var name = H.id('offline-name').value;
		var script = H.id('scratchpadScriptText').value;

		// save the script to chrome.storage.local
		// TODO: extract this into a service, so we aren't dependent upon Chrome's api 
		// (perhaps we're building an extension for firefox)
		//chrome.storage.local.set({ scratchpadScript: script, scratchpadName: name }, function() {
		//	console.log('saved scratchpad script');
        //});

		// send the script to the active/current window
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { workflow: "custom", code: script }, function(response) {
				console.log(response);
			});
			window.close();
		});
	});

	// click event on the Save button
	H.id('save-button').addEventListener('click', function() {
		var name = H.id('offline-name').value;
		var script = H.id('scratchpadScriptText').value;

		// retrieve from storage the current saved workflows
		storage.get('offline-workflows', function(workflows) {

			// make sure workflows isn't undefined
			workflows = workflows || [{ name: 'Scratchpad', script: H.id('scratchpadScriptText').value, selected: true }];

			// attempt to find a workflow with the same name
			var exists = false;
			for(var i = 0, l = workflows.length;i < l;++i) {
				
				// if a workflow with the same name exists, just update it
				if (workflows[i].name === name) {
					exists = true;
					workflows[i].script = script;
					workflows[i].selected = true;
					continue;
				}
				
				delete workflows[i].selected;
			}

			// if it wasn't found in the list, add it
			if (!exists) {
				workflows.push({ name: name, script: script, selected: true });
			}
			
			// now persist the new list
			storage.set({ "offline-workflows": workflows }, function() {
				H.refreshWorkflowsUI(workflows);
			});
		});
	});

	// click event on the Delete button
	H.id('delete-link').addEventListener('click', function() {
		var select = H.id('offline-list'),
			name = select.value;

		// retrieve from storage the current saved workflows
		storage.get('offline-workflows', function(workflows) {
			
			// filter out the deleted workflow (and disallow deletion of any item named Scratchpad)
			workflows = (workflows || []).filter(function(w) {
				return w.name !== name && name !== "Scratchpad";
			});

			// set the first option as selected (pretty sure the condition will never be false)
			if (workflows.length) workflows[0].selected = true;

			// reset workflows in storage, sans deleted item
			storage.set({ "offline-workflows": workflows }, function() {
				H.refreshWorkflowsUI(workflows);
			});

			// remove item from select input options
			select.remove(select.selectedIndex);
		});
	});

	///
	/// EVENTS
	///

	// set up the tabs
	(function setUpTabs(tabNames) {

		// iterate over each tab name
		tabNames.forEach(function forEachTab(tab, i, src) {

			// add click event listener to each tab
			H.id(tab).addEventListener('click', 

				function tabClickHandler(e) {
					
					// inactivate all tabs
					tabNames.forEach(function inactivateTab(t) {

						// edit the classes of the tab its content container
						H.id(t).classList.remove('active');
						H.id(t + '-content').classList.remove('active');
					});

					// activate the clicked tab and its content
					e.currentTarget.classList.add('active');
					H.id(e.currentTarget.id + '-content').classList.add('active');
				}
			);
		});
	})([
		'scratchpad', 
		'saved', 
		'settings'
	]);

	// change handler for testsuites
	H.id('testsuites').addEventListener('change', function testSuiteChangeHandler(e) {
		var select = H.id('tests');

		// disable and clear out the options
		select.disabled = true;
		for(var i = select.options.length - 1;i >= 0;--i)
			select.remove(i)

		// get the testsuite via the selected option
		api.testsuites.get(e.currentTarget.value, function (testsuite) {
			
			// populate the test dropdown
			testsuite.tests.forEach(function(test) {
				select.add(H.option(test.name, test.id))
			});

			// activate the dropdown
			select.disabled = false;
		});
	});

	// set up change event handler for tests
	H.id('tests').addEventListener('change', function testChangedHandler(e) {

		// get the data associated with selected test
		api.tests.get(e.currentTarget.value, function(test) {

			// display the fetched data
			H.id('savedName').value = test.name;
			H.id('savedScriptText').value = test.workflow.script;
			H.id('savedStartAtUrl').value = test.workflow.startaturl;
		});
	});
});


///
/// HELPERS
///

// helper function that provides oft-used functionality
var H = Helpers = {
	id: function (name) {
		return document.getElementById(name);
	},
	option: function (name, value) {
		var option = document.createElement('option');
		option.text = name;
		option.value = value;
		return option;
	},
	http: {
		get: function(url, callback) {
			this._send('GET', url, callback);
		},
		_send: function(httpMethod, url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open(httpMethod, url, true);
			xhr.onreadystatechange = function onReadyStateChange() {
				if (xhr.readyState == 4) {
					var resp = JSON.parse(xhr.responseText);
					callback(resp);
				}
			}
			xhr.send();
		}
	},
	refreshWorkflowsUI: function(workflows) {
		// grab the select element
		var select = H.id('offline-list');

		// disable and clear out the options
		for(var i = select.options.length - 1;i >= 0;--i)
			select.remove(i)

		// add options
		workflows.forEach(function(w) {

			// add options to the select 
			select.add(H.option(w.name, w.name));

			// mark as selected if needed
			if (w.selected) {
				select.value = w.name;
				H.id('offline-name').value = w.name;
				H.id('scratchpadScriptText').value = w.script;

				// if the current workflow is "Scratchpad", hide the delete link
				if (w.name === "Scratchpad") {
					H.id('delete-link').style.display = "none";
				}
			}
		});
	}
}

///
/// API PROXY
///

var ApiService = function(url) {

	// must pass into the url
	if (!url || !url.length) 
		throw 'must provide a baseUrl (i.e., http://auta.io/api) provided to ApiService constructor';

	// make sure baseUrl has a trailing slash, because all methods assume it does
	this.baseUrl = url + (url[url.length - 1] == '/' ? '' : '/');

	this.testsuites = {

		// {baseUrl}/testsuites
		getAll: (function(callback) {
			H.http.get(this.baseUrl + "testsuites", callback);
		}).bind(this),

		// {baseUrl}/testsuites/4
		get: (function(testsuiteId, callback) {
			H.http.get(this.baseUrl + "testsuites/" + testsuiteId, callback);
		}).bind(this)

	}

	this.tests = {

		// {baseUrl}/test/14
		get: (function(testId, callback) {
			H.http.get(this.baseUrl + "tests/" + testId, callback);
		}).bind(this)

	}

};

var StorageService = function() {

};

StorageService.prototype.get = function (key, callback) {
	chrome.storage.local.get(key, function(value) {
		callback(value[key]);
	});
};

StorageService.prototype.set = function (bag, callback) {
	chrome.storage.local.set(bag, callback);
};
