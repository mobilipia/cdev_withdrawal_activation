require('./env')

const watcher = require('./watcher')


watcher.watchCCCTransfers()
console.log('Started watching CSC transfers')


