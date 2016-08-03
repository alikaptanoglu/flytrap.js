define(
	'core/treeannotator', [
		'./pl/nodes/root',
		'./pl/grammarparser'
	],
	function(RootNode, GrammarParser) {

		

		var TreeAnnotator = {

			buildTree: function(jisonResult) {
				// RootNode's constructor will recursively build the tree we'll pass to flytrap
				return new RootNode(jisonResult.flytrap);
			},

			parse: function(script) {
				var stripped = this.stripComments(script);
				return GrammarParser.parse(stripped);
			},

			stripComments: function(script) {
				
				if (!script || !script.length || typeof(script) !== 'string') return "";
				
				// store our de-commentified result in a buffer of the same size as our script
				var buffer = new Array(script.length);

				// keep track of whether or not we're in a comment
				var inComment = false,
					inCommentBlock = false,
					inString = false;
				for(var i = 0, l = script.length;i < l;++i) {

					// is this the beginning of a string?  because comments don't count if their in strings, so set a flag
					if (!inString && !inComment && !inCommentBlock && script[i] === "'" && script[i + 1] !== "'") {
						inString = true;
						buffer[i] = script[i];
					}

					// is the the end of a string?  unset the flag
					else if (inString && script[i] === "'" && script[i + 1] !== "'") {
						inString = false;
						buffer[i] = script[i];
					}

					// if we're NOT inside a string or comment, and this char
					// and the next char are forward slashes, set the inComment flag
					// and set our buffer's chars to the empty string
					else if (!inString && !inComment && !inCommentBlock && script[i] === "/" && script[i + 1] === "/") {
						inComment = true;
						buffer[i] = buffer[i + 1] = "";
						++i;
					}

					// OR, if we're about to enter a /* ... */ comment block
					// set our flag 
					else if (!inString && !inComment && !inCommentBlock && script[i] === "/" && script[i + 1] === "*") {
						inCommentBlock = true;
						buffer[i] = buffer[i + 1] = "";
						++i;
					}

					// if we're inside a comment, and we encounter a newline/carriage return,
					// unset our inComment flag and resume setting the script's chars in our buffer
					else if (inComment && (script[i] === "\n" || script[i] === "\r")) {
						inComment = false;
						buffer[i] = script[i];
					}

					// if we're in a comment block and we encounter a comment terminator (*/)
					// unset our flag and set our buffer's chars to the empty string
					else if (inCommentBlock && script[i] === "*" && script.length - 1 > i && script[i + 1] === "/") {
						inCommentBlock = false;
						buffer[i] = buffer[i + 1] = "";
						++i;
					}

					// if we're in the meat of a comment, blank our buffer's char
					else if (inComment || inCommentBlock) {
						buffer[i] = "";
					}

					// if we're NOT in a comment, copy data to the buffer
					else {
						buffer[i] = script[i];
					}
				}

				return buffer.join("");
			},

			attachModules: function(jisonResult, callback) {
				
				// scan the tree for any module nodes (execute statements) and extract them
				this.attachParsedRepresentationsToModules(jisonResult.flytrap);

				// let our caller know we're done
				// right now, this is synchronous because we simply grab
				// the script text from a scripttag.  however, we are anticipating
				// asychronous operations to access scripts in the future
				callback(jisonResult);
			},


			attachParsedRepresentationsToModules: function(jisonResult) {
				this._attachParsedRepresentationsToModules(jisonResult.statement_list);
			},

			_attachParsedRepresentationsToModules: function(nodes) {

				if (!nodes || !nodes.length) 
					return;

				// go through each child node
				for(var i = 0, l = nodes.length;i < l;++i) {

					var node = nodes[i];

					// add to result if it is a module node
					if (node.type === 'module') {

						// get the name of the module
						var name = node.module.name.expr_str;

						// does this script exist on the page as a script tag?
						// TODO: this whole area will need an overhaul
						var scriptTag = document.getElementById("_flytrap_module_" + name);
						if (!scriptTag || !scriptTag.innerText) {
							console.log('Referenced module ' + name + ' must have a <script id ="_flytrap_module_' + name + '"> tag containing its automation script.');
							return;
						}

						// parse script and attach it to the passed in module
						node.module.parsed = this.parse(scriptTag.innerText);
					}

					// recurse
					this._attachParsedRepresentationsToModules(node.module ? node.module.parsed.flytrap.statement_list : node.statement_list);

				};

			}

		}

		

		return TreeAnnotator;
	}
);
