
echo 'Copying files'

# one of these will work during local dev, and one works in an aws env (yes horrible)
cp _build/lang/dest/output.min.chext.js chrome-extension/lib/output.min.js
cp dest/output.min.chext.js chrome-extension/lib/output.min.js
echo '^^^ THIS IS OK ^^^'

# one of these will work during local dev, and one works in an aws env (yes horrible)
cp _build/lang/core/persister.js chrome-extension/core/persister.js
cp core/persister.js chrome-extension/core/persister.js
echo '^^^ THIS IS OK ^^^'
cp -r lib/ chrome-extension/lib
for file in workflows/*.js; do cp "$file" "chrome-extension/workflows/";done
cp -r test/chrome-ext-tests/testWorkflow.js chrome-extension
rm _temp*.txt

echo 'Success'
