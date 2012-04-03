var pt = 'nxt>';

console.log('nxt node.js node extensions for building, running, deploying etc');
console.log('default commands are test run build clean');

var nxt = {};
nxt.test = 'test';
nxt.build = 'build';
nxt.clean = 'clean';
nxt.install_xt = 'install-xt';

nxt.run = function () {
    "use strict";
    console.log("running nxt");
};

var readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout),
    prefix = 'OHAI> ';

rl.on('line', function(line) {
    switch(line.trim()) {
        case 'hello':
            console.log('world!');
            break;
        default:
            console.log('Say what? I might have heard `' + line.trim() + '`');
            break;
    }
    rl.setPrompt(prefix, prefix.length);
    rl.prompt();
}).on('close', function() {
    console.log('Have a great day!');
    process.exit(0);
});
console.log(prefix + 'Good to see you. Try typing stuff.');
rl.setPrompt(prefix, prefix.length);
rl.prompt();
