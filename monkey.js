//var repl = require('./repl');
var rl = require('readline');
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




var start = repl.start("next>");
var _complete = start.complete

repl.complete = function(line){
    //console.log('-->line: ' + line);
    //_complete.apply(this,arguments);
};

//start.context.nxt = nxt;
//start.context.run = nxt.run;
//start.context.test = nxt.test;
//start.context.clean = nxt.clean;
//start.context.build = nxt.build;
