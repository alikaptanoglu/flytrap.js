
# use webpack to build output2.min.js
node ./node_modules/webpack/bin/webpack.js -p

# append some code to make it work with requirejs
echo ";if (typeof(define)!=='undefined') define('lib/output2.min', [], function() { return Flytrap; });" >> dest/output2.min.js

# next up, upgrade to the pro plan in instapage so you can host the site
