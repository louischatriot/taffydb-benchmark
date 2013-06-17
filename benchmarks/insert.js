var TAFFY = require('../taffy').taffy
  , async = require('async')
  , execTime = require('exec-time')
  , profiler = new execTime('INSERT BENCH')
  , commonUtilities = require('./commonUtilities')
  , config = commonUtilities.getConfiguration()
  , d = config.d
  , n = config.n
  ;

async.waterfall([
  function (cb) {
    n = 2 * n;   // We will actually insert twice as many documents
                 // because the index is slower when the collection is already
                 // big. So the result given by the algorithm will be a bit worse than
                 // actual performance
    cb();
  }
, function (cb) { profiler.beginProfiling(); return cb(); }
, async.apply(commonUtilities.insertDocs, d, n, profiler)
], function (err) {
  profiler.step("Benchmark finished");

  if (err) { return console.log("An error was encountered: ", err); }
});
