var fs = require('fs');

var exec  = require('child_process').exec;
var child;

var extPath = '/ext';
var curPath = fs.realpathSync('.');
var modPath = curPath + extPath;
var context = {
  src  : './src',
  dest : './target'
};

var readline = require('readline');
var osPath = curPath;
var prefix = 'nxt>';
var prompt = osPath + '\n' + prefix;

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
    //console.log("lc: " + req.lifecycle + " xt: " + req.extension);
    if(req && req.lifecycle && req.register){
      if(req.lifecycle != 'none'){
        var cmd = commandTree[req.lifecycle];
        if(cmd){
          pushFunction(cmd, req.register());
        }
      } else if (req.extension){
        var obj = req.register();
        for(var kw in obj){
          if(obj.hasOwnProperty(kw)){
            //console.log("kw: " + kw + " " + obj[kw]);
            commandTree[kw] = obj[kw];
          }
        }
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
      //console.log(commandTree);
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
  if(actions){
    //console.log('cmd: ' + command.key + ' ' + actions.length);
    actions.forEach(function(action){
      //console.log('type: ' + typeof action + ' ' + action.toString());
      action.call(new Object(), context);
    });
  } else {
    command.call({});
  }
};

// identify the command object to execute, first identifying and executing its dependencies
var runIfFound = function(cmds, command){
  if(command && cmds.indexOf(command.key)>-1){
    //console.log("found key: " + command.key);
    if(command.depends){
      runCmd(command.depends);
    }
    runCmd(command);
  } else if (!command && commandTree[cmds[0]]){
    runCmd(commandTree[cmds[0]],cmds);
  }
}; 

// os related for moving up and down
var runOS = function(cmd, execme){
  var cwd = 'cd ' + osPath;
  var fnl = cwd + ' ; ' + cmd;
  //console.log('fnl: ' + fnl);
  child = exec(fnl, execme);
};

var os = {
  cd: {
    run: function(cmds){
      if(cmds.length > 2){
        throw '"cd" Command paramaters cannot exceed 2';
      }
      if(cmds.length === 2){
        var cmmd = cmds.join(' ') + ' ; pwd';
        runOS(cmmd, function(error, stdout, stderr){
          if (error !== null) {
            console.log('stderr: ' + stderr);
            console.log('exec error: ' + error);
          } else {
            osPath = stdout.trim();
            prompt = osPath + '\nnxt>';
          }
        });
      }
      if(cmds.length === 1){
        // updatePath(path);
        console.log(osPath);
      }
    }
  },
  pwd: {
    run: function (cmds) {
      console.log('path: ' + osPath);
    }
  },
  ls: {
    run: function (cmds){
      var cmmd = cmds.join(' ');
      runOS(cmmd, function(error, stdout, stderr){
        if(error !== null){
          console.log('stderr: ' + stderr);
          console.log('exec error: ' + error);
        } else {
          console.log(stdout);
        }
      });
    }
  }
};

// // run if unix
var evalIfOS = function (cmds){
  if(cmds[0] && os.hasOwnProperty(cmds[0])){
    //console.log('I found a unix command ' + cmds[0]);
    os[cmds[0]].run(cmds);    
  }
}

// parse the command line given.  Execute as given.
var parse = function (line, callback){
  //console.log('.' + line + '.');
  var cmds = line.split(' ');

  //unix commands are top priority
  evalIfOS(cmds);

  // we'll probably hit a recursive black hole here.  need to go back.
  runIfFound(cmds, commandTree.clean);
  runIfFound(cmds, commandTree.build);
  runIfFound(cmds, commandTree.test);
  runIfFound(cmds, commandTree.run);
  runIfFound(cmds);

  // have to make this not call so soon.
  process.nextTick(callback);
};

// the next to the end executes the rl module.  
rl = readline.createInterface(process.stdin, process.stdout);
rl.on('line', function(line) {
  var cb = function(){
    rl.setPrompt(prompt, prefix.length);
    rl.prompt();
  }
  parse(line,cb);
}).on('close', function() {
  console.log('Have a great day!');
  process.exit(0);
});
console.log(prefix + 'Good to see you. Try typing stuff.');
rl.setPrompt(prompt, prefix.length);
rl.prompt();
