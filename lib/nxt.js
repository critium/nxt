var npm = require('npm');
var exec  = require('child_process').exec;
var child;


var readline = require('readline');
rl = readline.createInterface(process.stdin, process.stdout);

var path = '.';
var prefix = 'nxt>';
var prompt = path + '\n' + prefix;

var runCmd = function(cmd){
  var cwd = 'cd ' + path;
  var fnl = cwd + ' ; ' + cmd + ' ; pwd';
  //console.log('fnl: ' + fnl);
  child = exec(fnl, function (error, stdout, stderr) {
    //console.log('stdout: ' + stdout);
    //console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('stderr: ' + stderr);
      console.log('exec error: ' + error);
    } else {
      path = stdout.trim();
      prompt = path + '\nnxt>';
    }
  });
};

var unix = {
  cd: {
    run: function(cmds){
      if(cmds.length > 2){
        throw '"cd" Command paramaters cannot exceed 2';
      }
      if(cmds.length === 2){
        var cmmd = 'cd ' + cmds[1];
        runCmd(cmmd);
      }
      if(cmds.length === 1){
        // updatePath(path);
        console.log(path);

      }
    }
  },
  pwd: {
    run: function (cmds) {
      console.log(path);
    }
  },
};

// for(var cmd in npm.commands){
//   if(npm.commands.hasOwnProperty(cmd)){
//     onsole.log(cmd);
//   }
// 


// // run if unix
var evalIfUnix = function (cmds){
  if(cmds[0] && unix.hasOwnProperty(cmds[0])){
    //console.log('I found a unix command ' + cmds[0]);
    unix[cmds[0]].run(cmds);    
  }
}

// check if the command is from npm;
var evalIfNPM = function(cmds){
  if(cmds[0] && npm.commands.hasOwnProperty(cmds[0])){
    console.log('I found an npm command ' + cmds[0]);
    var cmd = cmds[0];
    npm.commands[cmd](cmds.slice(1));
  }
}

// parse the command line given.  Execute as given.
var parse = function (line){
  var cmds = line.split(' ');

  evalIfUnix(cmds);
  evalIfNPM(cmds);

  // we'll probably hit a recursive black hole here.  need to go back.
  //  runIfFound(cmds, commandTree.clean);
  //  runIfFound(cmds, commandTree.build);
  //  runIfFound(cmds, commandTree.test);
  //  runIfFound(cmds, commandTree.run);
};


// the next to the end executes the rl module.  
rl.on('line', function(line) {
  parse(line);
  rl.setPrompt(prompt, prefix.length);
  rl.prompt();
}).on('close', function() {
  console.log('Have a great day!');
  process.exit(0);
});
rl.setPrompt(prompt, prefix.length);
