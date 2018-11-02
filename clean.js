'use strict';

const del = require('del');

const directoriesToRemove = ['data', 'build', 'logs'];

del(directoriesToRemove).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
});
