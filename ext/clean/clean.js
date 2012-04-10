var wrench = require('wrench');

var clean = {
    lifecycle: 'clean',
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
    var result = [];
    result.push(clean.delDst);

    return result;
};

module.exports = clean;
