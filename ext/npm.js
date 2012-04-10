
var clean = {
    lifecycle: 'none',
    extension: 'true',
    delDst: function (context) {
        console.log("executing clean on " + context.dest);
        try {
            wrench.rmdirSyncRecursive(context.dest, function(err){
                console.log(err);
            });
        } catch (err) {
            console.log(err);
        }
    },

};

// register function is required.  this is called by the main app.
clean.register = function (){
    var result = {
      adduser: function (){console.log('adduser')},
      apihelp: function (){},
      author: function (){},
      bin: function (){},
      bugs: function (){},
      config: function (){}
    };

    return result;
};

module.exports = clean;
