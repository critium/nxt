var fs = require('fs');

var pt = 'nxt>';
var modPath = './nmod';
var context = {
    src  : './src',
    dest : './target'
};

// show the intro message
console.log('nxt node.js node extensions for building, running, deploying etc');
console.log('default commands are test run build clean');

// build the command tree.  the default command tree is based on 
// maven sensibilies.
// the actions array contains the actions to be executed on each command step.
var commandTree = {
    run : {
        key: 'run',
        actions: [],
    },
    build : {
        key: 'build',
        actions: []
    },
    test : {
        key: 'test',
        actions: []
    },
    clean : {
        key: 'clean',
        actions: []
    },

};

// build the dependencies between stages
commandTree.run.depends = commandTree.build;
commandTree.build.depends = commandTree.clean;
commandTree.test.depends = commandTree.build;
commandTree.clean.depends = null;

// insert the default logger;
// need to build this in...but for now, leave as TODO
var logger = function(pre){
    var self = this;
    self.pre = pre;
    self.log = function(message){
        console.log(pre + '\t-' + message);
    };
};
// commandTree.run.logger   = logger(commandTree.run.key);
// commandTree.test.logger  = logger(commandTree.test.key);
// commandTree.clean.logger = new logger(commandTree.clean.key);
// commandTree.build.logger = logger(commandTree.build.key);

// check array
var isArray = function (o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

// insert the default actions
var pushFunction = function(command, func){
    // console.log('1' + func + ' 2.' + isArray(func) + ' 3.' + func.toString());
    if(isArray(func)){
        command.actions = command.actions.concat(func);
    } else if (typeof func === 'Function'){
        command.actions.push(func);
    }
};

//load the default modules
var loadMods = function(modPath){
    var paths = fs.readdirSync(modPath);
    var stats, nodePath;
    var registerFunction = function (req){
        if(req && req.lifecycle && req.register){
            var cmd = commandTree[req.lifecycle];
            if(cmd){
                pushFunction(cmd, req.register());
            }
        }
    };
    paths.forEach(function(path){
        nodePath = modPath + '/' + path;
        stats = fs.statSync(nodePath);
        if(stats.isFile() || stats.isDirectory()){
            console.log('loading: ' + nodePath);
            var t = require(nodePath); 
            registerFunction(t);
        }

        // if(stats.isDirectory()){
        //     console.log('loading dir: ' + nodePath);
        //     var t = require(path);
        //     registerFunction(t);
        // }
    });

};
loadMods(modPath);

// useless stuff
var nxt = {};
nxt.test = 'test';
nxt.build = 'build';
nxt.clean = 'clean';
nxt.install_xt = 'install-xt';

// useless stuff
nxt.run = function () {
    "use strict";
    console.log("running nxt");
};

// execute the command object 
var runCmd = function(command){
    var actions = command.actions;
    console.log('cmd: ' + command.key + ' ' + actions.length);
    actions.forEach(function(action){
        console.log('type: ' + typeof action + ' ' + action.toString());
        action.call(new Object(), context);
    });
};

// identify the command object to execute, first identifying and executing its dependencies
var runIfFound = function(cmds, command){
    if(cmds.indexOf(command.key)>-1){
        console.log("found key: " + command.key);
        if(command.depends){
            runCmd(command.depends);
        }

        runCmd(command);
    }
}; 

// parse the command line given.  Execute as given.
var parse = function (line){
    var cmds = line.split(' ');

    // we'll probably hit a recursive black hole here.  need to go back.
    runIfFound(cmds, commandTree.clean);
    runIfFound(cmds, commandTree.build);
    runIfFound(cmds, commandTree.test);
    runIfFound(cmds, commandTree.run);
};

// the next to the end executes the rl module.  
var readline = require('readline'),
rl = readline.createInterface(process.stdin, process.stdout),
prefix = 'OHAI> ';

rl.on('line', function(line) {
    parse(line);
    rl.setPrompt(prefix, prefix.length);
    rl.prompt();
}).on('close', function() {
    console.log('Have a great day!');
    process.exit(0);
});
console.log(prefix + 'Good to see you. Try typing stuff.');
rl.setPrompt(prefix, prefix.length);
rl.prompt();
