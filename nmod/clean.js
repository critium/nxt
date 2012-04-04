var clean = {
    name: 'clean',
    delDst: function () {
        console.log('deleting destination directory');
    }
};

// clean.delDst();

clean.register = function (){
    var result = [];
    result.push(clean.delDst);

    return result;
};

module.exports = clean;
