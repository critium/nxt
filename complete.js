var complete = require('complete'); // get the `complete` module.


// list of items to complete on.
//
complete.list = ['apple', 'orange', 'pear', 'lemon', 'mango'];

complete.callback = function(lastSelection, userInput, reducedList) {

    if (lastSelection === 'apple') {
        complete.add('sauce');
    }
};

complete.init();

//
// continue with the application...
//
console.log('program started with the following arguments:', process.argv[2] || 'none provided');
