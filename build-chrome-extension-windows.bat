REM jison .\core\pl\flytrapgrammar.jison
copy flytrapgrammar.js .\core\pl\
echo define('core/pl/grammarparser', [], function() { > _temp1.txt
echo return parser; }); > _temp2.txt 
copy /b _temp1.txt+ .\core\pl\flytrapgrammar.js+_temp2.txt .\core\pl\grammarparser.js
del _temp1.txt
del _temp2.txt
del flytrapgrammar.js
robocopy .\core\ .\chrome-extension\core\
robocopy .\lib\ .\chrome-extension\lib\
robocopy .\workflows\ .\chrome-extension\workflows\
copy .\test\chrome-ext-tests\testWorkflow.js .\chrome-extension\
