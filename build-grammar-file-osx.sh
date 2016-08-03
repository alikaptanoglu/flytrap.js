jison core/pl/flytrapgrammar.jison
mv flytrapgrammar.js core/pl
echo '1 Building core/pl/grammarparser.js'
echo "define('core/pl/grammarparser', [], function() { " > _temp1.txt
echo ";var GrammarParser = parser;  return parser; });" > _temp2.txt
cat _temp1.txt core/pl/flytrapgrammar.js _temp2.txt > core/pl/grammarparser.js

echo 'Success'
